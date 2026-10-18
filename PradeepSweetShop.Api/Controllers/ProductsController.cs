using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ApplicationDbContext context) : ControllerBase
{
    // GET: api/products (Public - Active products and active price variants)
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int? categoryId, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 24)
    {
        var query = context.Products
            .Include(p => p.Category)
            .Include(p => p.Prices)
            .Where(p => p.IsActive && p.Category!.IsActive)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            query = query.Where(p => p.Name.Contains(search) ||
                                     (p.Description != null && p.Description.Contains(search)));
        }

        page = Math.Clamp(page, 1, 100000);
        pageSize = Math.Clamp(pageSize, 1, 100);
        Response.Headers["X-Total-Count"] = (await query.CountAsync()).ToString();
        var products = await query.AsNoTracking()
            .OrderBy(p => p.Name)
            .ThenBy(p => p.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CategoryId = p.CategoryId,
                CategoryName = p.Category!.Name,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                AverageRating = p.Reviews.Any(r => r.IsApproved)
                    ? Math.Round(p.Reviews.Where(r => r.IsApproved).Average(r => (double)r.Rating), 1)
                    : 0,
                ReviewCount = p.Reviews.Count(r => r.IsApproved),
                Prices = p.Prices
                    .Where(pr => pr.IsAvailable)
                    .Select(pr => new ProductPriceDto
                    {
                        Id = pr.Id,
                        Unit = pr.Unit,
                        Price = pr.Price,
                        StockQuantity = pr.StockQuantity,
                        IsAvailable = pr.IsAvailable
                    }).ToList()
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/products/admin (Admin - All products and variants)
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetProductsForAdmin()
    {
        var products = await context.Products
            .Include(p => p.Category)
            .Include(p => p.Prices)
            .OrderBy(p => p.Name)
            .Select(p => new ProductResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CategoryId = p.CategoryId,
                CategoryName = p.Category!.Name,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                AverageRating = p.Reviews.Any(r => r.IsApproved)
                    ? Math.Round(p.Reviews.Where(r => r.IsApproved).Average(r => (double)r.Rating), 1)
                    : 0,
                ReviewCount = p.Reviews.Count(r => r.IsApproved),
                Prices = p.Prices.Select(pr => new ProductPriceDto
                {
                    Id = pr.Id,
                    Unit = pr.Unit,
                    Price = pr.Price,
                    StockQuantity = pr.StockQuantity,
                    IsAvailable = pr.IsAvailable
                }).ToList()
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await context.Products
            .Include(p => p.Category)
            .Include(p => p.Prices)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && p.Category!.IsActive);

        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        var approvedReviews = product.Reviews.Where(r => r.IsApproved).ToList();
        var dto = new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            AverageRating = approvedReviews.Any() ? Math.Round(approvedReviews.Average(r => (double)r.Rating), 1) : 0,
            ReviewCount = approvedReviews.Count,
            Prices = [.. product.Prices.Select(pr => new ProductPriceDto
            {
                Id = pr.Id,
                Unit = pr.Unit,
                Price = pr.Price,
                StockQuantity = pr.StockQuantity,
                IsAvailable = pr.IsAvailable
            })]
        };

        return Ok(dto);
    }

    // POST: api/products (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] ProductCreateUpdateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Product name is required." });
        }

        if (request.Prices == null || request.Prices.Count == 0)
        {
            return BadRequest(new { message = "At least one pricing option/variant is required." });
        }

        var categoryExists = await context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
        {
            return BadRequest(new { message = "Invalid category." });
        }

        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            CategoryId = request.CategoryId,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive,
            Prices = [.. request.Prices.Select(p => new ProductPrice
            {
                Unit = p.Unit,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                IsAvailable = p.IsAvailable
            })]
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    // PUT: api/products/5 (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductCreateUpdateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Product name is required." });
        }

        if (request.Prices == null || request.Prices.Count == 0)
        {
            return BadRequest(new { message = "At least one pricing option/variant is required." });
        }

        var product = await context.Products
            .Include(p => p.Prices)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        var categoryExists = await context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
        {
            return BadRequest(new { message = "Invalid category." });
        }

        // Update product details
        if (request.Prices.Where(p => p.Id != 0).Any(p =>
            product.Prices.All(existing => existing.Id != p.Id) ||
            product.Prices.Any(existing => existing.Id == p.Id && p.OriginalStockQuantity != existing.StockQuantity)))
            return Conflict(new { message = "Stock changed while you were editing. Reopen this product to load the current stock." });
        if (request.Prices.Where(p => p.Id != 0).GroupBy(p => p.Id).Any(g => g.Count() > 1))
            return BadRequest(new { message = "Duplicate pack sizes are not allowed." });
        product.Name = request.Name;
        product.Description = request.Description;
        product.CategoryId = request.CategoryId;
        product.ImageUrl = request.ImageUrl;
        product.IsActive = request.IsActive;

        // Manage price variants:
        // Identify deleted variants (those in database but not in request)
        var requestPriceIds = request.Prices.Select(p => p.Id).ToList();
        var deletedPrices = product.Prices.Where(p => !requestPriceIds.Contains(p.Id)).ToList();
        
        foreach (var dp in deletedPrices)
        {
            // If the price variant has orders, we shouldn't hard-delete it, just deactivate it
            var hasOrders = await context.OrderItems.AnyAsync(oi => oi.ProductPriceId == dp.Id);
            if (hasOrders)
            {
                dp.IsAvailable = false;
            }
            else
            {
                context.ProductPrices.Remove(dp);
            }
        }

        // Add or update variants from request
        foreach (var rp in request.Prices)
        {
            if (rp.Id == 0) // New variant
            {
                product.Prices.Add(new ProductPrice
                {
                    Unit = rp.Unit,
                    Price = rp.Price,
                    StockQuantity = rp.StockQuantity,
                    IsAvailable = rp.IsAvailable
                });
            }
            else // Existing variant
            {
                var ep = product.Prices.FirstOrDefault(p => p.Id == rp.Id);
                if (ep != null)
                {
                    ep.Unit = rp.Unit;
                    ep.Price = rp.Price;
                    ep.StockQuantity = rp.StockQuantity;
                    ep.IsAvailable = rp.IsAvailable;
                }
            }
        }

        await context.SaveChangesAsync();
        return Ok(new { message = "Product updated successfully." });
    }

    // DELETE: api/products/5 (Admin only - soft deactivates or deletes if no order history)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        // Check if there are order items referencing this product
        var hasOrders = await context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrders)
        {
            // Soft delete by deactivating
            product.IsActive = false;
            await context.SaveChangesAsync();
            return Ok(new { message = "Product has order history. Deactivated instead of deleted.", deactivated = true });
        }

        context.Products.Remove(product);
        await context.SaveChangesAsync();
        return Ok(new { message = "Product deleted successfully.", deleted = true });
    }
}
