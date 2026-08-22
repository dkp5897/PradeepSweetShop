using Microsoft.EntityFrameworkCore;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Exceptions;
using PradeepSweetShop.Api.Helpers;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Services.Implementations;

public class AuthService(ApplicationDbContext context, ITokenService tokenService) : IAuthService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ITokenService _tokenService = tokenService;

    public async Task<AdminLoginResponse> LoginAsync(AdminLoginRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new BadRequestException("Username and password are required.");
        }

        var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
        {
            throw new UnauthorizedException("Invalid username or password.");
        }

        bool isPasswordValid = PasswordHasher.VerifyPassword(request.Password, user.PasswordHash, user.Salt);
        if (!isPasswordValid)
        {
            throw new UnauthorizedException("Invalid username or password.");
        }

        var tokenString = _tokenService.GenerateToken(user);

        user.LastLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new AdminLoginResponse
        {
            Token = tokenString,
            Username = user.Username,
            FullName = user.FullName
        };
    }
}
