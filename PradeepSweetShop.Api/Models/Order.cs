using System;
using System.Collections.Generic;

namespace PradeepSweetShop.Api.Models;

public class Order
{
    public int Id { get; set; }
    public required string OrderNumber { get; set; } // e.g. PSH-20260614-0001
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public required string DeliveryAddress { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string OrderStatus { get; set; } = "Pending"; // Pending, Confirmed, Preparing, OutForDelivery, Delivered, Cancelled
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = "CashOnDelivery";
    public string PaymentStatus { get; set; } = "Pending";
    public string? OrderNotes { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
