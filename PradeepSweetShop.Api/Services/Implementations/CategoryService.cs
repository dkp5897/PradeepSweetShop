using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Exceptions;
using PradeepSweetShop.Api.Models;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Services.Implementations;

public class CategoryService(ApplicationDbContext context) : ICategoryService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<Category>> GetActiveCategoriesAsync()
    {
        return await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetAllCategoriesForAdminAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category> GetCategoryByIdAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            throw new NotFoundException("Category not found.");
        }
        return category;
    }

    public async Task<Category> CreateCategoryAsync(Category category)
    {
        if (category == null || string.IsNullOrWhiteSpace(category.Name))
        {
            throw new BadRequestException("Category name is required.");
        }

        var exists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());
        if (exists)
        {
            throw new ConflictException("Category with this name already exists.");
        }

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return category;
    }

    public async Task<Category> UpdateCategoryAsync(int id, Category category)
    {
        if (category == null || id != category.Id)
        {
            throw new BadRequestException("ID mismatch.");
        }

        if (string.IsNullOrWhiteSpace(category.Name))
        {
            throw new BadRequestException("Category name is required.");
        }

        var dbCategory = await _context.Categories.FindAsync(id);
        if (dbCategory == null)
        {
            throw new NotFoundException("Category not found.");
        }

        var exists = await _context.Categories.AnyAsync(c => c.Id != id && c.Name.ToLower() == category.Name.ToLower());
        if (exists)
        {
            throw new ConflictException("Another category with this name already exists.");
        }

        dbCategory.Name = category.Name;
        dbCategory.Description = category.Description;
        dbCategory.IsActive = category.IsActive;

        await _context.SaveChangesAsync();
        return dbCategory;
    }

    public async Task<DeleteCategoryResponseDto> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            throw new NotFoundException("Category not found.");
        }

        var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
        if (hasProducts)
        {
            category.IsActive = false;
            await _context.SaveChangesAsync();
            return new DeleteCategoryResponseDto
            {
                Message = "Category has products. Deactivated instead of deleted.",
                Deactivated = true,
                Deleted = false
            };
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return new DeleteCategoryResponseDto
        {
            Message = "Category deleted successfully.",
            Deactivated = false,
            Deleted = true
        };
    }
}
