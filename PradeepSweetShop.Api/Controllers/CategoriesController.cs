using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(ApplicationDbContext context) : ControllerBase
{
    // GET: api/categories (Public - only active categories)
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await context.Categories
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
        var categories = await context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
        return Ok(categories);
    }

    // GET: api/categories/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await context.Categories.FindAsync(id);
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

        var exists = await context.Categories.AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());
        if (exists)
        {
            return BadRequest(new { message = "Category with this name already exists." });
        }

        context.Categories.Add(category);
        await context.SaveChangesAsync();

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

        var dbCategory = await context.Categories.FindAsync(id);
        if (dbCategory == null)
        {
            return NotFound(new { message = "Category not found." });
        }

        var exists = await context.Categories.AnyAsync(c => c.Id != id && c.Name.ToLower() == category.Name.ToLower());
        if (exists)
        {
            return BadRequest(new { message = "Another category with this name already exists." });
        }

        dbCategory.Name = category.Name;
        dbCategory.Description = category.Description;
        dbCategory.IsActive = category.IsActive;

        await context.SaveChangesAsync();
        return Ok(dbCategory);
    }

    // DELETE: api/categories/5 (Admin only - soft deactivates or deletes if no products)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound(new { message = "Category not found." });
        }

        // Check if there are products in this category
        var hasProducts = await context.Products.AnyAsync(p => p.CategoryId == id);
        if (hasProducts)
        {
            // If it has products, soft-delete by deactivating it
            category.IsActive = false;
            await context.SaveChangesAsync();
            return Ok(new { message = "Category has products. Deactivated instead of deleted.", deactivated = true });
        }

        context.Categories.Remove(category);
        await context.SaveChangesAsync();
        return Ok(new { message = "Category deleted successfully.", deleted = true });
    }
}
