using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api")]
public class ReviewsController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    // GET: api/products/5/reviews (Public - Get approved reviews for a product)
    [HttpGet("products/{productId}/reviews")]
    public async Task<IActionResult> GetProductReviews(int productId)
    {
        var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
        {
            return NotFound(new { message = "Product not found." });
        }

        var reviews = await _context.ProductReviews
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

        return Ok(reviews);
    }

    // POST: api/products/5/reviews (Public - Submit a review for a product)
    [HttpPost("products/{productId}/reviews")]
    public async Task<IActionResult> SubmitProductReview(int productId, [FromBody] ReviewCreateRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.CustomerName))
        {
            return BadRequest(new { message = "Customer name is required." });
        }

        if (request.Rating < 1 || request.Rating > 5)
        {
            return BadRequest(new { message = "Rating must be between 1 and 5 stars." });
        }

        var product = await _context.Products.FindAsync(productId);
        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        var review = new ProductReview
        {
            ProductId = productId,
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = string.IsNullOrWhiteSpace(request.CustomerEmail) ? null : request.CustomerEmail.Trim(),
            Rating = request.Rating,
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsApproved = true // Automatically approved by default
        };

        _context.ProductReviews.Add(review);
        await _context.SaveChangesAsync();

        var responseDto = new ProductReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            CustomerName = review.CustomerName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };

        return CreatedAtAction(nameof(GetProductReviews), new { productId }, responseDto);
    }

    // GET: api/reviews/admin (Admin - Get all reviews across all products)
    [Authorize(Roles = "Admin")]
    [HttpGet("reviews/admin")]
    public async Task<IActionResult> GetAllReviewsForAdmin()
    {
        var reviews = await _context.ProductReviews
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

        return Ok(reviews);
    }

    // DELETE: api/reviews/5 (Admin - Delete a review)
    [Authorize(Roles = "Admin")]
    [HttpDelete("reviews/{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.ProductReviews.FindAsync(id);
        if (review == null)
        {
            return NotFound(new { message = "Review not found." });
        }

        _context.ProductReviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review deleted successfully." });
    }
}
