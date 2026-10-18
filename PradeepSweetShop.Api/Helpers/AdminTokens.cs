using System.Security.Cryptography;
using System.Text;

namespace PradeepSweetShop.Api.Helpers;

public sealed class AdminTokens(IConfiguration configuration)
{
    public static string Group(string id, string version) => $"Admins:{id}:{version}";
    private readonly byte[] _key = Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!);
    // No password hash or salt is disclosed in the JWT. A changed password
    // changes this keyed version, immediately invalidating previous sessions.
    public string Version(string passwordHash) => Convert.ToHexString(
        HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes("admin-password:v1:" + passwordHash)));
}
