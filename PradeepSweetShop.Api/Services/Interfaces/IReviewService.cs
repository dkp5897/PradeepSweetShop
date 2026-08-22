using PradeepSweetShop.Api.DTOs;

namespace PradeepSweetShop.Api.Services.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ProductReviewDto>> GetProductReviewsAsync(int productId);
    Task<ProductReviewDto> SubmitProductReviewAsync(int productId, ReviewCreateRequest request);
    Task<IEnumerable<AdminReviewDto>> GetAllReviewsForAdminAsync();
    Task<MessageResponseDto> DeleteReviewAsync(int id);
}
