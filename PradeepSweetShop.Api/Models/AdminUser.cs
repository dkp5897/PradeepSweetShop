using System;

namespace PradeepSweetShop.Api.Models;

public class AdminUser
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string Salt { get; set; }
    public required string FullName { get; set; }
    public string Role { get; set; } = "Admin";
    public DateTime? LastLogin { get; set; }
}
