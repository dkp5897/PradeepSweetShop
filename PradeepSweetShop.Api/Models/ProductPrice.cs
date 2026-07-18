using System.Text.Json.Serialization;

namespace PradeepSweetShop.Api.Models;

public class ProductPrice
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    
    [JsonIgnore]
    public Product? Product { get; set; }
    
    public required string Unit { get; set; } // e.g., "1 Kg", "500 Gm", "250 Gm", "Piece", "Box (10 Pcs)"
    public decimal Price { get; set; } // Price in Rupees (₹)
    public int StockQuantity { get; set; } = 100;
    public bool IsAvailable { get; set; } = true;
}
