using System.Security.Cryptography;
using System.Text;

namespace PradeepSweetShop.Api.Helpers;

// A tracking reference is not proof of ownership. Only the private receipt token
// (or an authenticated administrator) grants access to tracking and its live group.
public sealed class TrackingTokens(IConfiguration configuration)
{
    private readonly byte[] _key = Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!);

    public string Create(string orderNumber) => Convert.ToHexString(
        HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes("order-tracking:v1:" + orderNumber)));

    public bool Validate(string orderNumber, string? token)
    {
        if (string.IsNullOrWhiteSpace(orderNumber) || orderNumber.Length > 100 || token?.Length != 64)
            return false;
        try
        {
            return CryptographicOperations.FixedTimeEquals(
                Convert.FromHexString(Create(orderNumber)), Convert.FromHexString(token));
        }
        catch (FormatException) { return false; }
    }
}
