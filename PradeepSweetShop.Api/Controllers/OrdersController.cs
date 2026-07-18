using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Hubs;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(ApplicationDbContext context, IHubContext<OrderHub> hubContext) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;
    private readonly IHubContext<OrderHub> _hubContext = hubContext;

    // GET: api/orders (Admin only - List all orders)
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductPrice)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.OrderStatus == status);
        }

        var orders = await query
            .OrderByDescending(o => o.OrderDate)
            .Select(o => MapToResponseDto(o))
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/orders/track/PSH-20260614-1234 (Public - Track an order by order number)
    [HttpGet("track/{orderNumber}")]
    public async Task<IActionResult> TrackOrder(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductPrice)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null)
        {
            return NotFound(new { message = "Order not found." });
        }

        return Ok(MapToResponseDto(order));
    }

    // POST: api/orders (Public - Place a new order)
    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] OrderCreateRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Invalid order request." });
        }

        if (string.IsNullOrWhiteSpace(request.CustomerName) || 
            string.IsNullOrWhiteSpace(request.CustomerPhone) || 
            string.IsNullOrWhiteSpace(request.DeliveryAddress))
        {
            return BadRequest(new { message = "Customer name, phone, and delivery address are required." });
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(new { message = "Order must contain at least one item." });
        }

        // Validate items and compute totals
        var orderItems = new List<OrderItem>();
        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null || !product.IsActive)
            {
                return BadRequest(new { message = $"Product with ID {item.ProductId} is not available." });
            }

            var priceOpt = await _context.ProductPrices.FirstOrDefaultAsync(p => p.Id == item.ProductPriceId && p.ProductId == item.ProductId);
            if (priceOpt == null || !priceOpt.IsAvailable)
            {
                return BadRequest(new { message = $"Pricing option for product {product.Name} is not available." });
            }

            if (priceOpt.StockQuantity < item.Quantity)
            {
                return BadRequest(new { message = $"Insufficient stock for {product.Name} ({priceOpt.Unit}). Available stock: {priceOpt.StockQuantity}." });
            }

            // Deduct stock
            priceOpt.StockQuantity -= item.Quantity;

            var orderItem = new OrderItem
            {
                ProductId = item.ProductId,
                ProductPriceId = item.ProductPriceId,
                Quantity = item.Quantity,
                UnitPrice = priceOpt.Price,
                TotalPrice = priceOpt.Price * item.Quantity
            };

            orderItems.Add(orderItem);
            totalAmount += orderItem.TotalPrice;
        }

        // Generate a unique order number: PSH-yyyyMMdd-{RandomNumber}
        var random = new Random();
        var orderNumber = $"PSH-{DateTime.UtcNow:yyyyMMdd}-{random.Next(1000, 9999)}";

        // Double check uniqueness (just in case of collision)
        while (await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber))
        {
            orderNumber = $"PSH-{DateTime.UtcNow:yyyyMMdd}-{random.Next(1000, 9999)}";
        }

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            CustomerEmail = request.CustomerEmail,
            DeliveryAddress = request.DeliveryAddress,
            OrderNotes = request.OrderNotes,
            TotalAmount = totalAmount,
            OrderItems = orderItems,
            OrderDate = DateTime.UtcNow,
            OrderStatus = "Pending",
            PaymentMethod = "CashOnDelivery",
            PaymentStatus = "Pending"
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Reload order with relations to get names in response and SignalR
        var savedOrder = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductPrice)
            .FirstAsync(o => o.Id == order.Id);

        var responseDto = MapToResponseDto(savedOrder);

        // Notify Admins in real-time
        await _hubContext.Clients.Group("Admins").SendAsync("NewOrderReceived", responseDto);

        return CreatedAtAction(nameof(TrackOrder), new { orderNumber = order.OrderNumber }, responseDto);
    }

    // PUT: api/orders/5/status (Admin only - Update order status)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { message = "Status is required." });
        }

        var validStatuses = new[] { "Pending", "Confirmed", "Preparing", "OutForDelivery", "Delivered", "Cancelled" };
        if (!validStatuses.Contains(request.Status))
        {
            return BadRequest(new { message = $"Invalid status. Allowed values are: {string.Join(", ", validStatuses)}" });
        }

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductPrice)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = "Order not found." });
        }

        // Handle inventory restore if cancelled
        if (request.Status == "Cancelled" && order.OrderStatus != "Cancelled")
        {
            foreach (var item in order.OrderItems)
            {
                if (item.ProductPrice is not null)
                {
                    item.ProductPrice.StockQuantity += item.Quantity;
                }
            }
        }
        // Handle inventory re-deduction if moving away from Cancelled
        else if (order.OrderStatus == "Cancelled" && request.Status != "Cancelled")
        {
            foreach (var item in order.OrderItems)
            {
                if (item.ProductPrice is not null)
                {
                    // Check if stock available
                    if (item.ProductPrice.StockQuantity < item.Quantity)
                    {
                        return BadRequest(new { message = $"Cannot revert cancellation: Insufficient stock for variant '{item.ProductPrice.Unit}'." });
                    }
                    item.ProductPrice.StockQuantity -= item.Quantity;
                }
            }
        }

        order.OrderStatus = request.Status;
        if (request.Status == "Delivered")
        {
            order.PaymentStatus = "Completed";
        }
        else if (request.Status == "Cancelled")
        {
            order.PaymentStatus = "Cancelled";
        }

        await _context.SaveChangesAsync();

        // Notify customer order tracking page in real-time
        await _hubContext.Clients.Group(order.OrderNumber).SendAsync("OrderStatusUpdated", new {
            orderNumber = order.OrderNumber,
            status = order.OrderStatus,
            paymentStatus = order.PaymentStatus
        });

        return Ok(new { 
            message = "Order status updated successfully.", 
            status = order.OrderStatus,
            paymentStatus = order.PaymentStatus
        });
    }

    private static OrderResponseDto MapToResponseDto(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            CustomerEmail = order.CustomerEmail,
            DeliveryAddress = order.DeliveryAddress,
            OrderDate = order.OrderDate,
            OrderStatus = order.OrderStatus,
            TotalAmount = order.TotalAmount,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            OrderNotes = order.OrderNotes,
            OrderItems = [.. order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product?.Name,
                ProductPriceId = oi.ProductPriceId,
                UnitName = oi.ProductPrice?.Unit,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice
            })]
        };
    }
}
