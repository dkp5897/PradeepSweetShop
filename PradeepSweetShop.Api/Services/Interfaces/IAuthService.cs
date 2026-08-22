using PradeepSweetShop.Api.DTOs;

namespace PradeepSweetShop.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AdminLoginResponse> LoginAsync(AdminLoginRequest request);
}
