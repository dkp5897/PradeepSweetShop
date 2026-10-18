namespace PradeepSweetShop.Api.Models;

public sealed class ShopOptions
{
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
    public string OpeningHours { get; set; } = "";
    public string[] DeliveryPincodes { get; set; } = [];
    public decimal MinimumOrder { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal FreeDeliveryFrom { get; set; }
    public int EstimatedDeliveryMinutes { get; set; }

    public decimal FeeFor(decimal subtotal) => subtotal >= FreeDeliveryFrom ? 0 : DeliveryFee;
}
