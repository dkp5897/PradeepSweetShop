using System.Text.Json.Serialization;

namespace PradeepSweetShop.Api.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    
    [JsonIgnore]
    public Order? Order { get; set; }
    
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    
    public int ProductPriceId { get; set; }
    public ProductPrice? ProductPrice { get; set; }
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
