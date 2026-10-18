using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api")]
public class ReviewsController(ApplicationDbContext context) : ControllerBase
{
    // GET: api/products/5/reviews (Public - Get approved reviews for a product)
    [HttpGet("products/{productId}/reviews")]
    public async Task<IActionResult> GetProductReviews(int productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var productExists = await context.Products.AnyAsync(p => p.Id == productId);
        if (!productExists)
        {
            return NotFound(new { message = "Product not found." });
        }

        var query = context.ProductReviews.AsNoTracking().Where(r => r.ProductId == productId && r.IsApproved);
        Response.Headers["X-Total-Count"] = (await query.CountAsync()).ToString();
        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .ThenByDescending(r => r.Id)
            .Skip((Math.Clamp(page, 1, 100000) - 1) * Math.Clamp(pageSize, 1, 50)).Take(Math.Clamp(pageSize, 1, 50))
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
    [EnableRateLimiting("reviews")]
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

        var product = await context.Products.FindAsync(productId);
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
            IsApproved = false
        };

        context.ProductReviews.Add(review);
        await context.SaveChangesAsync();

        var responseDto = new ProductReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            CustomerName = review.CustomerName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };

        return CreatedAtAction(nameof(GetProductReviews), new { productId }, new { message = "Your review has been submitted for approval.", review = responseDto });
    }

    // GET: api/reviews/admin (Admin - Get all reviews across all products)
    [Authorize(Roles = "Admin")]
    [HttpGet("reviews/admin")]
    public async Task<IActionResult> GetAllReviewsForAdmin([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        Response.Headers["X-Total-Count"] = (await context.ProductReviews.CountAsync()).ToString();
        var reviews = await context.ProductReviews.AsNoTracking()
            .Include(r => r.Product)
            .OrderByDescending(r => r.CreatedAt)
            .ThenByDescending(r => r.Id)
            .Skip((Math.Clamp(page, 1, 100000) - 1) * Math.Clamp(pageSize, 1, 100)).Take(Math.Clamp(pageSize, 1, 100))
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
    [HttpPut("reviews/{id}/approval")]
    public async Task<IActionResult> SetApproval(int id, ReviewApprovalRequest request)
    {
        var review = await context.ProductReviews.FindAsync(id);
        if (review is null) return NotFound(new { message = "Review not found." });
        review.IsApproved = request.IsApproved;
        await context.SaveChangesAsync();
        return Ok(new { review.Id, review.IsApproved });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("reviews/{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await context.ProductReviews.FindAsync(id);
        if (review == null)
        {
            return NotFound(new { message = "Review not found." });
        }

        context.ProductReviews.Remove(review);
        await context.SaveChangesAsync();

        return Ok(new { message = "Review deleted successfully." });
    }
}
