using Microsoft.AspNetCore.Mvc;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AdminAuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AdminLoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }
}
