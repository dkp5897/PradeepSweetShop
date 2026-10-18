using System.ComponentModel.DataAnnotations;
using PradeepSweetShop.Api.Helpers;

namespace PradeepSweetShop.Api.DTOs;

// --- AUTH DTOs ---
public class AdminLoginRequest
{
    [Required, StringLength(100)]
    public required string Username { get; set; }
    [Required, StringLength(200)]
    public required string Password { get; set; }
}

public class AdminLoginResponse
{
    public required string Token { get; set; }
    public required string Username { get; set; }
    public required string FullName { get; set; }
}

public class AdminPasswordRequest
{
    [Required, StringLength(200)]
    public required string CurrentPassword { get; set; }
    [Required, StringLength(200, MinimumLength = 12)]
    public required string NewPassword { get; set; }
}

// --- PRODUCT DTOs ---
public class ProductPriceDto
{
    [Range(0, 1000000)]
    public int? OriginalStockQuantity { get; set; }
    public int Id { get; set; }
    [Required, StringLength(50)]
    public required string Unit { get; set; }
    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal Price { get; set; }
    [Range(0, 1000000)]
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class ProductResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public List<ProductPriceDto> Prices { get; set; } = [];
}

public class ProductCreateUpdateRequest
{
    [Required, StringLength(200)]
    public required string Name { get; set; }
    [StringLength(2000)]
    public string? Description { get; set; }
    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
    [StringLength(2000), Url]
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    [Required, MinLength(1), MaxLength(20)]
    public List<ProductPriceDto> Prices { get; set; } = [];
}

// --- REVIEW DTOs ---
public class ProductReviewDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public required string CustomerName { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReviewCreateRequest
{
    [Required, StringLength(100)]
    public required string CustomerName { get; set; }
    [EmailAddress, StringLength(254)]
    public string? CustomerEmail { get; set; }
    [Range(1, 5)]
    public int Rating { get; set; } // Must be 1 to 5
    [StringLength(2000)]
    public string? Comment { get; set; }
}

public class AdminReviewDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public required string CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsApproved { get; set; }
}

// --- ORDER DTOs ---
public class OrderItemRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }
    [Range(1, int.MaxValue)]
    public int ProductPriceId { get; set; }
    [Range(1, 100)]
    public int Quantity { get; set; }
}

public class OrderCreateRequest : IValidatableObject
{
    [Required, RegularExpression(@"^[0-9]{6}$")]
    public required string Pincode { get; set; }
    [Range(typeof(decimal), "0.01", "100000000")]
    public decimal? ExpectedTotal { get; set; }
    [Required, StringLength(100)]
    public required string CustomerName { get; set; }
    [Required, StringLength(25)]
    public required string CustomerPhone { get; set; }
    [EmailAddress, StringLength(254)]
    public string? CustomerEmail { get; set; }
    [Required, StringLength(500, MinimumLength = 10)]
    public required string DeliveryAddress { get; set; }
    [StringLength(1000)]
    public string? OrderNotes { get; set; }
    [Required, MinLength(1), MaxLength(50)]
    public List<OrderItemRequest> Items { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (PhoneNumbers.Normalize(CustomerPhone) is null)
            yield return new ValidationResult("Enter a valid Indian mobile number, optionally prefixed with +91.", [nameof(CustomerPhone)]);
        if (Items?.Any(i => i is null) == true)
        {
            yield return new ValidationResult("Order items cannot be null.", [nameof(Items)]);
            yield break;
        }
        if (Items?.GroupBy(i => i.ProductPriceId).Any(g => g.Sum(i => (long)i.Quantity) > 100) == true)
            yield return new ValidationResult("A maximum of 100 units per pack size can be ordered.", [nameof(Items)]);
    }
}

public class OrderItemResponseDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int ProductPriceId { get; set; }
    public string? UnitName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class OrderResponseDto
{
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public string? TrackingToken { get; set; }
    public int Id { get; set; }
    public required string OrderNumber { get; set; }
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public required string DeliveryAddress { get; set; }
    public DateTime OrderDate { get; set; }
    public required string OrderStatus { get; set; }
    public decimal TotalAmount { get; set; }
    public required string PaymentMethod { get; set; }
    public required string PaymentStatus { get; set; }
    public string? OrderNotes { get; set; }
    public List<OrderItemResponseDto> OrderItems { get; set; } = [];
}

public class ReviewApprovalRequest
{
    public bool IsApproved { get; set; }
}

public class OrderStatusUpdateRequest
{
    public required string Status { get; set; }
}
