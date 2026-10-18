using System.Security.Cryptography;
using System.Text;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.Helpers;
using PradeepSweetShop.Api.Hubs;
using PradeepSweetShop.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Development retains a generated secret in an ignored local file; production
// must supply its own random secret through environment or secret storage.
var secret = builder.Configuration["JwtSettings:Secret"];
if (string.IsNullOrWhiteSpace(secret) && builder.Environment.IsDevelopment())
{
    var directory = Path.Combine(builder.Environment.ContentRootPath, ".local");
    Directory.CreateDirectory(directory);
    var path = Path.Combine(directory, "jwt-key");
    if (!File.Exists(path)) File.WriteAllText(path, Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)));
    secret = File.ReadAllText(path).Trim();
    builder.Configuration["JwtSettings:Secret"] = secret;
}
if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 64 ||
    secret.Contains("SuperSecretKeyForPradeep", StringComparison.Ordinal))
    throw new InvalidOperationException("Set JwtSettings__Secret to a new random secret of at least 64 bytes.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddSingleton<TrackingTokens>();
builder.Services.AddSingleton<AdminTokens>();
var shop = builder.Configuration.GetSection("Shop").Get<ShopOptions>() ?? new ShopOptions();
if (shop.MinimumOrder < 0 || shop.DeliveryFee < 0 || shop.FreeDeliveryFrom < 0 ||
    shop.MinimumOrder > 1000000 || shop.DeliveryFee > 1000000 || shop.EstimatedDeliveryMinutes <= 0 ||
    shop.DeliveryPincodes.Length == 0 || shop.DeliveryPincodes.Any(pin => !System.Text.RegularExpressions.Regex.IsMatch(pin, @"^[0-9]{6}$")))
    throw new InvalidOperationException("Configure valid shop delivery rules before starting the API.");
builder.Services.AddSingleton(shop);
builder.Services.AddCors(options => options.AddPolicy("CorsPolicy", policy =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
    if (origins.Length > 0) policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
        .WithExposedHeaders("X-Total-Count", "Retry-After");
}));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        ClockSkew = TimeSpan.Zero
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Path.StartsWithSegments("/hubs/orders"))
                context.Token = context.Request.Query["access_token"];
            return Task.CompletedTask;
        },
        OnTokenValidated = async context =>
        {
            if (!int.TryParse(context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
            { context.Fail("Invalid session."); return; }
            var database = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
            var user = await database.AdminUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            var versions = context.HttpContext.RequestServices.GetRequiredService<AdminTokens>();
            if (user is null || context.Principal?.FindFirstValue(ClaimTypes.Role) != user.Role ||
                context.Principal?.FindFirstValue("password_version") != versions.Version(user.PasswordHash))
                context.Fail("The session has expired. Sign in again.");
        }
    };
});
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter = Math.Ceiling(retryAfter.TotalSeconds).ToString();
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Too many requests. Please wait a minute and try again." }, cancellationToken);
    };
    foreach (var (name, limit) in new[] { ("login", 5), ("orders", 10), ("reviews", 5), ("tracking", 30), ("hub", 60) })
        options.AddPolicy(name, httpContext => RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = builder.Configuration.GetValue<int?>("RateLimits:" + name) ?? limit,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});

var app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment()) app.MapOpenApi();
else { app.UseHsts(); app.UseHttpsRedirection(); }
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers.CacheControl = "no-store";
    await next();
});
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
app.MapHub<OrderHub>("/hubs/orders").RequireRateLimiting("hub");

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (app.Environment.IsDevelopment())
    {
        context.Database.EnsureCreated();
        using var resource = typeof(ApplicationDbContext).Assembly.GetManifestResourceStream(
            "PradeepSweetShop.Api.Data.upgrade-orders.sql")!;
        using var reader = new StreamReader(resource);
        context.Database.ExecuteSqlRaw(reader.ReadToEnd());
        DbInitializer.Initialize(context, builder.Configuration);
    }
    else
    {
        if (!await context.Database.CanConnectAsync())
            throw new InvalidOperationException("Database is unavailable.");
        // Provisioning is explicit in production; never seed a default account.
        foreach (var user in await context.AdminUsers.ToListAsync())
            if (PasswordHasher.VerifyPassword("admin123", user.PasswordHash, user.Salt) ||
                PasswordHasher.VerifyPassword("adminpassword123", user.PasswordHash, user.Salt))
                throw new InvalidOperationException("Replace the development admin password before production deployment.");
    }
}
app.Run();
