namespace PradeepSweetShop.Api.Models;

public class ProductReview
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public required string CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public int Rating { get; set; } // 1 to 5
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsApproved { get; set; } = true;
}
