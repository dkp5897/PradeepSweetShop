using Microsoft.AspNetCore.Mvc;
using PradeepSweetShop.Api.Models;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/shop")]
public class ShopController(ShopOptions shop) : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(shop);
}
