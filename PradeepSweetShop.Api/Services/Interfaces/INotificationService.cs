using PradeepSweetShop.Api.DTOs;

namespace PradeepSweetShop.Api.Services.Interfaces;

public interface INotificationService
{
    Task NotifyNewOrderAsync(OrderResponseDto order);
    Task NotifyOrderStatusUpdatedAsync(string orderNumber, string status, string paymentStatus);
}
