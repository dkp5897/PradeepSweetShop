using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Exceptions;
using PradeepSweetShop.Api.Models;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Services.Implementations;

public class ProductService(ApplicationDbContext context) : IProductService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<ProductResponseDto>> GetProductsAsync(int? categoryId, string? search)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Prices)
            .Where(p => p.IsActive && p.Category!.IsActive);

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(p => p.Name.Contains(searchTerm) || (p.Description != null && p.Description.Contains(searchTerm)));
        }

        return await query
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
                    ? Math.Round(p.Reviews.Where(r => r.IsApproved).Select(r => (double)r.Rating).Average(), 1)
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
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAllProductsForAdminAsync()
    {
        return await _context.Products
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
                    ? Math.Round(p.Reviews.Where(r => r.IsApproved).Select(r => (double)r.Rating).Average(), 1)
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
    }

    public async Task<ProductResponseDto> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Prices)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Id == id) ?? throw new NotFoundException("Product not found.");

        var approvedReviews = product.Reviews.Where(r => r.IsApproved).ToList();
        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            AverageRating = approvedReviews.Count > 0 ? Math.Round(approvedReviews.Select(r => (double)r.Rating).Average(), 1) : 0,
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
    }

    public async Task<ProductResponseDto> CreateProductAsync(ProductCreateUpdateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Name))
        {
            throw new BadRequestException("Product name is required.");
        }

        if (request.Prices == null || request.Prices.Count == 0)
        {
            throw new BadRequestException("At least one pricing option/variant is required.");
        }

        var category = await _context.Categories.FindAsync(request.CategoryId) ?? throw new BadRequestException("Invalid category.");

        var product = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CategoryId = request.CategoryId,
            ImageUrl = request.ImageUrl?.Trim(),
            IsActive = request.IsActive,
            Prices = [.. request.Prices.Select(p => new ProductPrice
            {
                Unit = p.Unit.Trim(),
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                IsAvailable = p.IsAvailable
            })]
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CategoryName = category.Name,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            AverageRating = 0,
            ReviewCount = 0,
            Prices = [.. product.Prices.Select(pr => new ProductPriceDto
            {
                Id = pr.Id,
                Unit = pr.Unit,
                Price = pr.Price,
                StockQuantity = pr.StockQuantity,
                IsAvailable = pr.IsAvailable
            })]
        };
    }

    public async Task<ProductResponseDto> UpdateProductAsync(int id, ProductCreateUpdateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Name))
        {
            throw new BadRequestException("Product name is required.");
        }

        if (request.Prices == null || request.Prices.Count == 0)
        {
            throw new BadRequestException("At least one pricing option/variant is required.");
        }

        var product = await _context.Products
            .Include(p => p.Prices)
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id) ?? throw new NotFoundException("Product not found.");

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
        {
            throw new BadRequestException("Invalid category.");
        }

        // Update product details
        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.CategoryId = request.CategoryId;
        product.ImageUrl = request.ImageUrl?.Trim();
        product.IsActive = request.IsActive;

        // Manage price variants
        var requestPriceIds = request.Prices.Select(p => p.Id).ToList();
        var deletedPrices = product.Prices.Where(p => !requestPriceIds.Contains(p.Id)).ToList();

        foreach (var dp in deletedPrices)
        {
            var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductPriceId == dp.Id);
            if (hasOrders)
            {
                dp.IsAvailable = false;
            }
            else
            {
                _context.ProductPrices.Remove(dp);
            }
        }

        foreach (var rp in request.Prices)
        {
            if (rp.Id == 0) // New variant
            {
                product.Prices.Add(new ProductPrice
                {
                    Unit = rp.Unit.Trim(),
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
                    ep.Unit = rp.Unit.Trim();
                    ep.Price = rp.Price;
                    ep.StockQuantity = rp.StockQuantity;
                    ep.IsAvailable = rp.IsAvailable;
                }
            }
        }

        await _context.SaveChangesAsync();

        return await GetProductByIdAsync(id);
    }

    public async Task<DeleteProductResponseDto> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id) ?? throw new NotFoundException("Product not found.");

        var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrders)
        {
            product.IsActive = false;
            await _context.SaveChangesAsync();
            return new DeleteProductResponseDto
            {
                Message = "Product has order history. Deactivated instead of deleted.",
                Deactivated = true,
                Deleted = false
            };
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return new DeleteProductResponseDto
        {
            Message = "Product deleted successfully.",
            Deactivated = false,
            Deleted = true
        };
    }
}
