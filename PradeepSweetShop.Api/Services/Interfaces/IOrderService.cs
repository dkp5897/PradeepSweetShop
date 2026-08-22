using PradeepSweetShop.Api.DTOs;

namespace PradeepSweetShop.Api.Services.Interfaces;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetOrdersAsync(string? status);
    Task<OrderResponseDto> TrackOrderAsync(string orderNumber);
    Task<OrderResponseDto> PlaceOrderAsync(OrderCreateRequest request);
    Task<OrderStatusUpdateResponseDto> UpdateOrderStatusAsync(int id, OrderStatusUpdateRequest request);
}
