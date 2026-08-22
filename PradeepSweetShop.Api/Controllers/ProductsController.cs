using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PradeepSweetShop.Api.DTOs;
using PradeepSweetShop.Api.Services.Interfaces;

namespace PradeepSweetShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService productService) : ControllerBase
{
    private readonly IProductService _productService = productService;

    // GET: api/products (Public - Active products and active price variants)
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int? categoryId, [FromQuery] string? search)
    {
        var products = await _productService.GetProductsAsync(categoryId, search);
        return Ok(products);
    }

    // GET: api/products/admin (Admin - All products and variants)
    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetProductsForAdmin()
    {
        var products = await _productService.GetAllProductsForAdminAsync();
        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        return Ok(product);
    }

    // POST: api/products (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] ProductCreateUpdateRequest request)
    {
        var created = await _productService.CreateProductAsync(request);
        return CreatedAtAction(nameof(GetProduct), new { id = created.Id }, created);
    }

    // PUT: api/products/5 (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductCreateUpdateRequest request)
    {
        var updated = await _productService.UpdateProductAsync(id, request);
        return Ok(updated);
    }

    // DELETE: api/products/5 (Admin only - soft deactivates or deletes if no order history)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var result = await _productService.DeleteProductAsync(id);
        return Ok(result);
    }
}
