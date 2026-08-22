using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api")]
public class ReviewsController(IReviewService reviewService) : ControllerBase
{
    private readonly IReviewService _reviewService = reviewService;

    // GET: api/products/5/reviews (Public - Get approved reviews for a product)
    [HttpGet("products/{productId}/reviews")]
    public async Task<IActionResult> GetProductReviews(int productId)
    {
        var reviews = await _reviewService.GetProductReviewsAsync(productId);
        return Ok(reviews);
    }

    // POST: api/products/5/reviews (Public - Submit a review for a product)
    [HttpPost("products/{productId}/reviews")]
    public async Task<IActionResult> SubmitProductReview(int productId, [FromBody] ReviewCreateRequest request)
    {
        var review = await _reviewService.SubmitProductReviewAsync(productId, request);
        return CreatedAtAction(nameof(GetProductReviews), new { productId }, review);
    }

    // GET: api/reviews/admin (Admin - Get all reviews across all products)
    [Authorize(Roles = "Admin")]
    [HttpGet("reviews/admin")]
    public async Task<IActionResult> GetAllReviewsForAdmin()
    {
        var reviews = await _reviewService.GetAllReviewsForAdminAsync();
        return Ok(reviews);
    }

    // DELETE: api/reviews/5 (Admin - Delete a review)
    [Authorize(Roles = "Admin")]
    [HttpDelete("reviews/{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var result = await _reviewService.DeleteReviewAsync(id);
        return Ok(result);
    }
}
