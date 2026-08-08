namespace PradeepSweetShop.Api.Models;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProductPrice> Prices { get; set; } = new List<ProductPrice>();
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
}
