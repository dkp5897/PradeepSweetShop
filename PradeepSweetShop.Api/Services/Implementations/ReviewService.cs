using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Exceptions;
using PradeepSweetShop.Api.Models;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Services.Implementations;

public class ReviewService(ApplicationDbContext context) : IReviewService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IEnumerable<ProductReviewDto>> GetProductReviewsAsync(int productId)
    {
        var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
        {
            throw new NotFoundException("Product not found.");
        }

        return await _context.ProductReviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ProductReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                CustomerName = r.CustomerName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ProductReviewDto> SubmitProductReviewAsync(int productId, ReviewCreateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.CustomerName))
        {
            throw new BadRequestException("Customer name is required.");
        }

        if (request.Rating < 1 || request.Rating > 5)
        {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }

        var product = await _context.Products.FindAsync(productId);
        if (product == null)
        {
            throw new NotFoundException("Product not found.");
        }

        var review = new ProductReview
        {
            ProductId = productId,
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail) ? null : request.CustomerEmail.Trim(),
            Rating = request.Rating,
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsApproved = true
        };

        _context.ProductReviews.Add(review);
        await _context.SaveChangesAsync();

        return new ProductReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            CustomerName = review.CustomerName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<IEnumerable<AdminReviewDto>> GetAllReviewsForAdminAsync()
    {
        return await _context.ProductReviews
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new AdminReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                ProductName = r.Product != null ? r.Product.Name : "Deleted Product",
                CustomerName = r.CustomerName,
                CustomerEmail = r.CustomerEmail,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsApproved = r.IsApproved
            })
            .ToListAsync();
    }

    public async Task<MessageResponseDto> DeleteReviewAsync(int id)
    {
        var review = await _context.ProductReviews.FindAsync(id);
        if (review == null)
        {
            throw new NotFoundException("Review not found.");
        }

        _context.ProductReviews.Remove(review);
        await _context.SaveChangesAsync();

        return new MessageResponseDto
        {
            Message = "Review deleted successfully."
        };
    }
}
