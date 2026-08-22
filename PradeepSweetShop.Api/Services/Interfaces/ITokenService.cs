using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Services.Interfaces;

public interface ITokenService
{
    string GenerateToken(AdminUser user);
}
