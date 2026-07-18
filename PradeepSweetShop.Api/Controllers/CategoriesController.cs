using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/categories (Public - only active categories)
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync();
        return Ok(categories);
    }

    // GET: api/categories/admin (Admin - all categories)
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetCategoriesForAdmin()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
        return Ok(categories);
    }

    // GET: api/categories/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound(new { message = "Category not found." });
        }
        return Ok(category);
    }

    // POST: api/categories (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        if (category == null || string.IsNullOrWhiteSpace(category.Name))
        {
            return BadRequest(new { message = "Category name is required." });
        }

        var exists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());
        if (exists)
        {
            return BadRequest(new { message = "Category with this name already exists." });
        }

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    // PUT: api/categories/5 (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category category)
    {
        if (id != category.Id)
        {
            return BadRequest(new { message = "ID mismatch." });
        }

        if (string.IsNullOrWhiteSpace(category.Name))
        {
            return BadRequest(new { message = "Category name is required." });
        }

        var dbCategory = await _context.Categories.FindAsync(id);
        if (dbCategory == null)
        {
            return NotFound(new { message = "Category not found." });
        }

        var exists = await _context.Categories.AnyAsync(c => c.Id != id && c.Name.ToLower() == category.Name.ToLower());
        if (exists)
        {
            return BadRequest(new { message = "Another category with this name already exists." });
        }

        dbCategory.Name = category.Name;
        dbCategory.Description = category.Description;
        dbCategory.IsActive = category.IsActive;

        await _context.SaveChangesAsync();
        return Ok(dbCategory);
    }

    // DELETE: api/categories/5 (Admin only - soft deactivates or deletes if no products)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound(new { message = "Category not found." });
        }

        // Check if there are products in this category
        var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
        if (hasProducts)
        {
            // If it has products, soft-delete by deactivating it
            category.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Category has products. Deactivated instead of deleted.", deactivated = true });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Category deleted successfully.", deleted = true });
    }
}
