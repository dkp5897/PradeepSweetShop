using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

namespace PradeepSweetShop.Api.Models;

public class Category
{
    public int Id { get; set; }
    [Required, StringLength(100)]
    public required string Name { get; set; }
    [StringLength(1000)]
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    [JsonIgnore]
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
