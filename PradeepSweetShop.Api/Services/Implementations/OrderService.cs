using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Exceptions;
using PradeepSweetShop.Api.Models;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Services.Implementations;

public class OrderService(ApplicationDbContext context, INotificationService notificationService) : IOrderService
{
    private readonly ApplicationDbContext _context = context;
    private readonly INotificationService _notificationService = notificationService;

    private static readonly string[] ValidStatuses = ["Pending", "Confirmed", "Preparing", "OutForDelivery", "Delivered", "Cancelled"];

    public async Task<IEnumerable<OrderResponseDto>> GetOrdersAsync(string? status)
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
            .ToListAsync();

        return orders.Select(MapToResponseDto);
    }

    public async Task<OrderResponseDto> TrackOrderAsync(string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
        {
            throw new BadRequestException("Order number is required.");
        }

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductPrice)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber.Trim());

        if (order == null)
        {
            throw new NotFoundException("Order not found.");
        }

        return MapToResponseDto(order);
    }

    public async Task<OrderResponseDto> PlaceOrderAsync(OrderCreateRequest request)
    {
        if (request == null)
        {
            throw new BadRequestException("Invalid order request.");
        }

        if (string.IsNullOrWhiteSpace(request.CustomerName) || 
            string.IsNullOrWhiteSpace(request.CustomerPhone) || 
            string.IsNullOrWhiteSpace(request.DeliveryAddress))
        {
            throw new BadRequestException("Customer name, phone, and delivery address are required.");
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            throw new BadRequestException("Order must contain at least one item.");
        }

        var orderItems = new List<OrderItem>();
        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null || !product.IsActive)
            {
                throw new BadRequestException($"Product with ID {item.ProductId} is not available.");
            }

            var priceOpt = await _context.ProductPrices.FirstOrDefaultAsync(p => p.Id == item.ProductPriceId && p.ProductId == item.ProductId);
            if (priceOpt == null || !priceOpt.IsAvailable)
            {
                throw new BadRequestException($"Pricing option for product {product.Name} is not available.");
            }

            if (priceOpt.StockQuantity < item.Quantity)
            {
                throw new BadRequestException($"Insufficient stock for {product.Name} ({priceOpt.Unit}). Available stock: {priceOpt.StockQuantity}.");
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

        while (await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber))
        {
            orderNumber = $"PSH-{DateTime.UtcNow:yyyyMMdd}-{random.Next(1000, 9999)}";
        }

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail) ? null : request.CustomerEmail.Trim(),
            DeliveryAddress = request.DeliveryAddress.Trim(),
            OrderNotes = string.IsNullOrWhiteSpace(request.OrderNotes) ? null : request.OrderNotes.Trim(),
            TotalAmount = totalAmount,
            OrderItems = orderItems,
            OrderDate = DateTime.UtcNow,
            OrderStatus = "Pending",
            PaymentMethod = "CashOnDelivery",
            PaymentStatus = "Pending"
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Reload order with relations
        var savedOrder = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductPrice)
            .FirstAsync(o => o.Id == order.Id);

        var responseDto = MapToResponseDto(savedOrder);

        // Notify Admins via SignalR
        await _notificationService.NotifyNewOrderAsync(responseDto);

        return responseDto;
    }

    public async Task<OrderStatusUpdateResponseDto> UpdateOrderStatusAsync(int id, OrderStatusUpdateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Status))
        {
            throw new BadRequestException("Status is required.");
        }

        var newStatus = request.Status.Trim();
        if (!ValidStatuses.Contains(newStatus))
        {
            throw new BadRequestException($"Invalid status. Allowed values are: {string.Join(", ", ValidStatuses)}");
        }

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ProductPrice)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            throw new NotFoundException("Order not found.");
        }

        // Handle inventory restore if transitioning to Cancelled
        if (newStatus == "Cancelled" && order.OrderStatus != "Cancelled")
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
        else if (order.OrderStatus == "Cancelled" && newStatus != "Cancelled")
        {
            foreach (var item in order.OrderItems)
            {
                if (item.ProductPrice is not null)
                {
                    if (item.ProductPrice.StockQuantity < item.Quantity)
                    {
                        throw new BadRequestException($"Cannot revert cancellation: Insufficient stock for variant '{item.ProductPrice.Unit}'.");
                    }
                    item.ProductPrice.StockQuantity -= item.Quantity;
                }
            }
        }

        order.OrderStatus = newStatus;
        if (newStatus == "Delivered")
        {
            order.PaymentStatus = "Completed";
        }
        else if (newStatus == "Cancelled")
        {
            order.PaymentStatus = "Cancelled";
        }

        await _context.SaveChangesAsync();

        // Notify customer tracker via SignalR
        await _notificationService.NotifyOrderStatusUpdatedAsync(order.OrderNumber, order.OrderStatus, order.PaymentStatus);

        return new OrderStatusUpdateResponseDto
        {
            Message = "Order status updated successfully.",
            Status = order.OrderStatus,
            PaymentStatus = order.PaymentStatus
        };
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
