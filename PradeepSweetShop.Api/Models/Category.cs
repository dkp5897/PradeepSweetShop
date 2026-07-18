using System.Text.Json.Serialization;

namespace PradeepSweetShop.Api.Models;

public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    [JsonIgnore]
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
