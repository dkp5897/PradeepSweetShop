using System;
using System.Collections.Generic;

namespace PradeepSweetShop.Api.DTOs;

// --- AUTH DTOs ---
public class AdminLoginRequest
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}

public class AdminLoginResponse
{
    public required string Token { get; set; }
    public required string Username { get; set; }
    public required string FullName { get; set; }
}

// --- PRODUCT DTOs ---
public class ProductPriceDto
{
    public int Id { get; set; }
    public required string Unit { get; set; }
    public decimal Price { get; set; }
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
    public List<ProductPriceDto> Prices { get; set; } = [];
}

public class ProductCreateUpdateRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ProductPriceDto> Prices { get; set; } = [];
}

// --- ORDER DTOs ---
public class OrderItemRequest
{
    public int ProductId { get; set; }
    public int ProductPriceId { get; set; }
    public int Quantity { get; set; }
}

public class OrderCreateRequest
{
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public required string DeliveryAddress { get; set; }
    public string? OrderNotes { get; set; }
    public List<OrderItemRequest> Items { get; set; } = [];
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

public class OrderStatusUpdateRequest
{
    public required string Status { get; set; }
}
