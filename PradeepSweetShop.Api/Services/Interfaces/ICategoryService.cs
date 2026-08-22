using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetActiveCategoriesAsync();
    Task<IEnumerable<Category>> GetAllCategoriesForAdminAsync();
    Task<Category> GetCategoryByIdAsync(int id);
    Task<Category> CreateCategoryAsync(Category category);
    Task<Category> UpdateCategoryAsync(int id, Category category);
    Task<DeleteCategoryResponseDto> DeleteCategoryAsync(int id);
}
