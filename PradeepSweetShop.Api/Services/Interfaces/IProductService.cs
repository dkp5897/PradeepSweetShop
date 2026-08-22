using PradeepSweetShop.Api.DTOs;

namespace PradeepSweetShop.Api.Services.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetProductsAsync(int? categoryId, string? search);
    Task<IEnumerable<ProductResponseDto>> GetAllProductsForAdminAsync();
    Task<ProductResponseDto> GetProductByIdAsync(int id);
    Task<ProductResponseDto> CreateProductAsync(ProductCreateUpdateRequest request);
    Task<ProductResponseDto> UpdateProductAsync(int id, ProductCreateUpdateRequest request);
    Task<DeleteProductResponseDto> DeleteProductAsync(int id);
}
