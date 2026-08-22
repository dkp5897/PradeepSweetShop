using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    private readonly IOrderService _orderService = orderService;

    // GET: api/orders (Admin only - List all orders)
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status)
    {
        var orders = await _orderService.GetOrdersAsync(status);
        return Ok(orders);
    }

    // GET: api/orders/track/PSH-20260614-1234 (Public - Track an order by order number)
    [HttpGet("track/{orderNumber}")]
    public async Task<IActionResult> TrackOrder(string orderNumber)
    {
        var order = await _orderService.TrackOrderAsync(orderNumber);
        return Ok(order);
    }

    // POST: api/orders (Public - Place a new order)
    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] OrderCreateRequest request)
    {
        var order = await _orderService.PlaceOrderAsync(request);
        return CreatedAtAction(nameof(TrackOrder), new { orderNumber = order.OrderNumber }, order);
    }

    // PUT: api/orders/5/status (Admin only - Update order status)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateRequest request)
    {
        var result = await _orderService.UpdateOrderStatusAsync(id, request);
        return Ok(result);
    }
}
