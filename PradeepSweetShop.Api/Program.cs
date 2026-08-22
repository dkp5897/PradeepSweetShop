using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using PradeepSweetShop.Api.Data;
using PradeepSweetShop.Api.Hubs;
using PradeepSweetShop.Api.Middleware;
using PradeepSweetShop.Api.Services.Implementations;
using PradeepSweetShop.Api.Services.Interfaces;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 0. Use Serilog configured directly from appsettings.json
builder.Host.UseSerilog((context, services, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// 1. Add DbContext with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Add CORS Policy (allowing React client)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // Allow any local development origin/port dynamically
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Critical for SignalR WebSockets
    });
});

// 3. Add Authentication with JWT Bearer tokens
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "SuperSecretKeyForPradeepSweetShop123456SecurityTokenKey!!!";
var keyBytes = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "PradeepSweetShopApi",
        ValidAudience = jwtSettings["Audience"] ?? "PradeepSweetShopClient",
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.Name
    };

    // Only intercept query-string tokens for SignalR WebSocket connections.
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("JWT Authentication failed: {Message}", context.Exception.Message);
            return Task.CompletedTask;
        }
    };
});

// 4. Register Application Services (SOLID: Dependency Inversion Principle)
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// 5. Register Global Exception Handling
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 6. Add Controllers & SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// 7. Configure Swagger / OpenAPI with DocumentFilter
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Pradeep Sweets House API",
        Version = "v1",
        Description = "Interactive API documentation and testing portal for Pradeep Sweets House"
    });

    // Define Bearer scheme for Swagger UI Authorize button
    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Paste your JWT token here (without 'Bearer'). Swagger adds the prefix automatically."
    });

    // Document filter that accurately marks ONLY [Authorize] endpoints with security requirement
    options.DocumentFilter<AuthorizeCheckDocumentFilter>();
});

var app = builder.Build();

// 8. Global Exception Handler Middleware (First in pipeline)
app.UseExceptionHandler();

// Enable Swagger UI middleware
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pradeep Sweets House API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();

// CORS must be called before authentication
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

// Map routes and Hubs
app.MapControllers();
app.MapHub<OrderHub>("/hubs/orders");

// 9. Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    DbInitializer.Initialize(context);
}

app.Run();
