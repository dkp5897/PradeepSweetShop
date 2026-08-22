using Microsoft.AspNetCore.SignalR;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Hubs;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Services.Implementations;

public class NotificationService(IHubContext<OrderHub> hubContext) : INotificationService
{
    private readonly IHubContext<OrderHub> _hubContext = hubContext;

    public async Task NotifyNewOrderAsync(OrderResponseDto order)
    {
        await _hubContext.Clients.Group("Admins").SendAsync("NewOrderReceived", order);
    }

    public async Task NotifyOrderStatusUpdatedAsync(string orderNumber, string status, string paymentStatus)
    {
        var payload = new
        {
            orderNumber,
            status,
            paymentStatus
        };

        await _hubContext.Clients.Group(orderNumber).SendAsync("OrderStatusUpdated", payload);
        await _hubContext.Clients.Group("Admins").SendAsync("OrderStatusUpdated", payload);
    }
}
