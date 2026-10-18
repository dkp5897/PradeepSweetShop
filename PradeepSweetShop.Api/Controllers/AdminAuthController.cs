using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Helpers;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AdminAuthController(ApplicationDbContext context, IConfiguration config, AdminTokens tokens) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] AdminLoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required." });
        }

        var user = await context.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        // Verify password
        bool isPasswordValid = PasswordHasher.VerifyPassword(request.Password, user.PasswordHash, user.Salt);
        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        // Generate JWT Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(config["JwtSettings:Secret"]!);
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.GivenName, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("password_version", tokens.Version(user.PasswordHash))
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(config["JwtSettings:ExpiryInMinutes"] ?? "360")),
            Issuer = config["JwtSettings:Issuer"],
            Audience = config["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        // Update last login
        user.LastLogin = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return Ok(new AdminLoginResponse
        {
            Token = tokenString,
            Username = user.Username,
            FullName = user.FullName
        });
    }

    [Authorize(Roles = "Admin")]
    [EnableRateLimiting("login")]
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(AdminPasswordRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Unauthorized();
        var user = await context.AdminUsers.FindAsync(id);
        if (user is null || !PasswordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash, user.Salt))
            return BadRequest(new { message = "The current password is incorrect." });
        if (request.NewPassword == request.CurrentPassword)
            return BadRequest(new { message = "Choose a different password." });
        if (request.NewPassword is "admin123" or "adminpassword123")
            return BadRequest(new { message = "Choose a unique password instead of the previous development password." });
        var (hash, salt) = PasswordHasher.HashPassword(request.NewPassword);
        user.PasswordHash = hash; user.Salt = salt;
        await context.SaveChangesAsync();
        return Ok(new { message = "Password changed. Sign in again with your new password." });
    }
}
