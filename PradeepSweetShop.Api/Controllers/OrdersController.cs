using System.Data;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Helpers;
using PradeepSweetShop.Api.Hubs;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(ApplicationDbContext context, IHubContext<OrderHub> hub,
    TrackingTokens tokens, AdminTokens adminTokens, ShopOptions shop, ILogger<OrdersController> logger) : ControllerBase
{
    private IQueryable<Order> WithItems(IQueryable<Order>? query = null) =>
        (query ?? context.Orders).Include(o => o.OrderItems).ThenInclude(i => i.Product)
            .Include(o => o.OrderItems).ThenInclude(i => i.ProductPrice);

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = WithItems().AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(o => o.OrderStatus == status);
        page = Math.Clamp(page, 1, 100000);
        pageSize = Math.Clamp(pageSize, 1, 100);
        Response.Headers["X-Total-Count"] = (await query.CountAsync()).ToString();
        var orders = await query.OrderByDescending(o => o.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(orders.Select(o => Map(o, true)));
    }

    [HttpGet("track/{orderNumber}")]
    [EnableRateLimiting("tracking")]
    public async Task<IActionResult> TrackOrder(string orderNumber, [FromHeader(Name = "X-Tracking-Token")] string? token)
    {
        // Return the same response for missing, unknown, and unauthorized references.
        if (!User.IsInRole("Admin") && !tokens.Validate(orderNumber, token))
            return NotFound(new { message = "Order not found. Check your order reference and private tracking code." });
        var order = await WithItems().AsNoTracking().FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);
        if (order is null) return NotFound(new { message = "Order not found." });
        return Ok(Map(order, User.IsInRole("Admin")));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("summary")]
    public async Task<IActionResult> Summary() => Ok(new
    {
        pending = await context.Orders.CountAsync(o => o.OrderStatus == "Pending"),
        preparing = await context.Orders.CountAsync(o => o.OrderStatus == "Preparing"),
        revenue = await context.Orders.Where(o => o.OrderStatus == "Delivered").SumAsync(o => (decimal?)o.TotalAmount) ?? 0,
        products = await context.Products.CountAsync()
    });

    [HttpPost]
    [EnableRateLimiting("orders")]
    public async Task<IActionResult> PlaceOrder(OrderCreateRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? requestKey)
    {
        if (!Guid.TryParseExact(requestKey, "D", out var parsedKey))
            return BadRequest(new { message = "A valid Idempotency-Key is required. Refresh checkout and try again." });
        requestKey = parsedKey.ToString("D");
        request.CustomerName = request.CustomerName.Trim();
        request.CustomerPhone = PhoneNumbers.Normalize(request.CustomerPhone)!;
        request.DeliveryAddress = request.DeliveryAddress.Trim();
        request.CustomerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail) ? null : request.CustomerEmail.Trim();
        request.OrderNotes = string.IsNullOrWhiteSpace(request.OrderNotes) ? null : request.OrderNotes.Trim();
        var fingerprint = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(request))));

        try
        {
            await using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            // Serialize retries of a request across API instances, without locking unrelated orders.
            var lockName = "checkout:" + requestKey;
            await context.Database.ExecuteSqlInterpolatedAsync($@"
                DECLARE @result int;
                EXEC @result = sp_getapplock @Resource={lockName}, @LockMode='Exclusive',
                    @LockOwner='Transaction', @LockTimeout=10000;
                IF @result < 0 THROW 50001, 'Checkout is busy. Retry the same request.', 1;");
            var existing = await WithItems().FirstOrDefaultAsync(o => o.RequestKey == requestKey);
            if (existing is not null)
            {
                if (existing.RequestHash != fingerprint)
                    return Conflict(new { message = "This checkout reference was already used for different details. Start a new order." });
                await transaction.CommitAsync();
                return Ok(Map(existing, false));
            }

            if (!shop.DeliveryPincodes.Contains(request.Pincode))
                return BadRequest(new { message = $"We currently deliver to pincode {string.Join(", ", shop.DeliveryPincodes)}." });

            var ids = request.Items.Select(i => i.ProductPriceId).Distinct().ToArray();
            var variants = await context.ProductPrices.AsNoTracking().Include(p => p.Product)
                .ThenInclude(p => p!.Category).Where(p => ids.Contains(p.Id)).ToDictionaryAsync(p => p.Id);
            var orderItems = new List<OrderItem>();
            foreach (var group in request.Items.GroupBy(i => new { i.ProductId, i.ProductPriceId }).OrderBy(g => g.Key.ProductPriceId))
            {
                var quantity = group.Sum(i => i.Quantity);
                if (!variants.TryGetValue(group.Key.ProductPriceId, out var variant) ||
                    variant.ProductId != group.Key.ProductId || !variant.IsAvailable ||
                    variant.Product?.IsActive != true || variant.Product.Category?.IsActive != true)
                    return BadRequest(new { message = "An item is no longer available. Please review your cart." });

                // The condition and decrement are one SQL operation. A concurrent
                // buyer must wait and then recheck stock against the committed value.
                var changed = await context.ProductPrices
                    .Where(p => p.Id == variant.Id && p.IsAvailable && p.Price == variant.Price && p.StockQuantity >= quantity && p.Product!.IsActive && p.Product.Category!.IsActive)
                    .ExecuteUpdateAsync(update => update.SetProperty(p => p.StockQuantity, p => p.StockQuantity - quantity));
                if (changed != 1)
                    return Conflict(new { message = $"Not enough stock for {variant.Product.Name} ({variant.Unit}). Please review your cart." });
                orderItems.Add(new OrderItem
                {
                    ProductId = variant.ProductId,
                    ProductPriceId = variant.Id,
                    Quantity = quantity,
                    UnitPrice = variant.Price,
                    TotalPrice = variant.Price * quantity
                });
            }

            var subtotal = orderItems.Sum(i => i.TotalPrice);
            if (subtotal < shop.MinimumOrder)
                return BadRequest(new { message = $"The minimum order is ₹{shop.MinimumOrder:0.##}, excluding delivery." });
            var deliveryFee = shop.FeeFor(subtotal);
            var total = subtotal + deliveryFee;
            if (request.ExpectedTotal is not null && total != request.ExpectedTotal)
                return Conflict(new { message = "Prices have changed. Refresh your cart and confirm the updated total." });
            var order = new Order
            {
                OrderNumber = $"PSH-{DateTime.UtcNow:yyyyMMdd}-{Convert.ToHexString(RandomNumberGenerator.GetBytes(12))}",
                RequestKey = requestKey,
                RequestHash = fingerprint,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                CustomerEmail = request.CustomerEmail,
                DeliveryAddress = request.DeliveryAddress + ", Pincode " + request.Pincode,
                OrderNotes = request.OrderNotes,
                TotalAmount = total,
                DeliveryFee = deliveryFee,
                OrderItems = orderItems
            };
            context.Orders.Add(order);
            await context.SaveChangesAsync();
            await transaction.CommitAsync();
            var saved = await WithItems().AsNoTracking().SingleAsync(o => o.Id == order.Id);
            await NotifyAdmins(saved);
            return CreatedAtAction(nameof(TrackOrder), new { orderNumber = order.OrderNumber }, Map(saved, false));
        }
        catch (SqlException ex) when (ex.Number is 1205 or 50001)
        {
            return Conflict(new { message = "Checkout is busy. Please retry; your checkout reference will prevent a duplicate order." });
        }
    }

    // The random checkout key is a private recovery credential. Serialize with
    // submission so a lost response can be resolved before a changed retry.
    [HttpGet("receipt")]
    [EnableRateLimiting("tracking")]
    public async Task<IActionResult> RecoverReceipt([FromHeader(Name = "X-Checkout-Key")] string? key)
    {
        if (!Guid.TryParseExact(key, "D", out var parsed)) return NotFound();
        await using var transaction = await context.Database.BeginTransactionAsync();
        var lockName = "checkout:" + parsed.ToString("D");
        await context.Database.ExecuteSqlInterpolatedAsync($@"
            DECLARE @result int;
            EXEC @result = sp_getapplock @Resource={lockName}, @LockMode='Exclusive',
                @LockOwner='Transaction', @LockTimeout=10000;
            IF @result < 0 THROW 50001, 'Checkout is busy.', 1;");
        var order = await WithItems().AsNoTracking().SingleOrDefaultAsync(o => o.RequestKey == parsed.ToString("D"));
        await transaction.CommitAsync();
        return order is null ? NoContent() : Ok(Map(order, false));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, OrderStatusUpdateRequest request)
    {
        await using var transaction = await context.Database.BeginTransactionAsync();
        var order = await WithItems(context.Orders.FromSqlInterpolated(
            $"SELECT * FROM [Orders] WITH (UPDLOCK, ROWLOCK) WHERE [Id]={id}")).SingleOrDefaultAsync();
        if (order is null) return NotFound(new { message = "Order not found." });
        var next = order.OrderStatus switch
        {
            "Pending" => ["Confirmed", "Cancelled"],
            "Confirmed" => ["Preparing", "Cancelled"],
            "Preparing" => ["OutForDelivery", "Cancelled"],
            "OutForDelivery" => ["Delivered", "Cancelled"],
            _ => Array.Empty<string>()
        };
        if (request.Status != order.OrderStatus && !next.Contains(request.Status))
            return Conflict(new { message = $"Cannot change {order.OrderStatus} to {request.Status}." });
        if (request.Status == "Cancelled" && order.OrderStatus != "Cancelled")
            foreach (var item in order.OrderItems.OrderBy(i => i.ProductPriceId))
                await context.ProductPrices.Where(p => p.Id == item.ProductPriceId)
                    .ExecuteUpdateAsync(update => update.SetProperty(p => p.StockQuantity, p => p.StockQuantity + item.Quantity));
        order.OrderStatus = request.Status;
        order.PaymentStatus = request.Status == "Delivered" ? "Completed" : request.Status == "Cancelled" ? "Cancelled" : "Pending";
        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        await Notify(order.OrderNumber, "OrderStatusUpdated", new
        {
            orderNumber = order.OrderNumber,
            status = order.OrderStatus,
            paymentStatus = order.PaymentStatus
        });
        return Ok(new { status = order.OrderStatus, paymentStatus = order.PaymentStatus });
    }

    // Notification failures must never turn a committed order into a failed checkout.
    private async Task NotifyAdmins(Order order)
    {
        try
        {
            var admins = await context.AdminUsers.AsNoTracking().Where(a => a.Role == "Admin").ToListAsync();
            foreach (var admin in admins)
                await Notify(AdminTokens.Group(admin.Id.ToString(), adminTokens.Version(admin.PasswordHash)), "NewOrderReceived", Map(order, true));
        }
        catch (Exception ex) { logger.LogWarning(ex, "Admin notifications failed; the order was saved."); }
    }

    private async Task Notify(string group, string name, object payload)
    {
        try { await hub.Clients.Group(group).SendAsync(name, payload); }
        catch (Exception ex) { logger.LogWarning(ex, "Live notification failed; the saved order remains available."); }
    }

    private OrderResponseDto Map(Order order, bool includePersonalDetails) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        TrackingToken = tokens.Create(order.OrderNumber),
        Subtotal = order.OrderItems.Sum(i => i.TotalPrice),
        DeliveryFee = order.DeliveryFee,
        CustomerName = includePersonalDetails ? order.CustomerName : "",
        CustomerPhone = includePersonalDetails ? order.CustomerPhone : "",
        CustomerEmail = includePersonalDetails ? order.CustomerEmail : null,
        DeliveryAddress = includePersonalDetails ? order.DeliveryAddress : "",
        OrderNotes = includePersonalDetails ? order.OrderNotes : null,
        OrderDate = order.OrderDate,
        OrderStatus = order.OrderStatus,
        TotalAmount = order.TotalAmount,
        PaymentMethod = order.PaymentMethod,
        PaymentStatus = order.PaymentStatus,
        OrderItems = [.. order.OrderItems.Select(i => new OrderItemResponseDto
        {
            Id = i.Id, ProductId = i.ProductId, ProductName = i.Product?.Name,
            ProductPriceId = i.ProductPriceId, UnitName = i.ProductPrice?.Unit,
            Quantity = i.Quantity, UnitPrice = i.UnitPrice, TotalPrice = i.TotalPrice
        })]
    };
}
