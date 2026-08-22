using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using PradeepSweetShop.Api.Exceptions;

namespace PradeepSweetShop.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger = logger;

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        int statusCode;
        string message;
        var requestMethod = httpContext.Request.Method;
        var requestPath = httpContext.Request.Path + httpContext.Request.QueryString;
        var user = httpContext.User?.Identity?.IsAuthenticated == true ? httpContext.User.Identity.Name : "Anonymous";
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

        if (exception is AppException appException)
        {
            statusCode = (int)appException.StatusCode;
            message = appException.Message;

            _logger.LogWarning(
                "Client/Application Error [{StatusCode}] on {Method} {Path} | User: {User} | IP: {IP} | TraceId: {TraceId} | Message: {Message}",
                statusCode,
                requestMethod,
                requestPath,
                user,
                clientIp,
                httpContext.TraceIdentifier,
                message);
        }
        else
        {
            statusCode = (int)HttpStatusCode.InternalServerError;
            message = "An unexpected error occurred. Please try again later.";

            _logger.LogError(
                exception,
                "Unhandled Server Error [500] on {Method} {Path} | User: {User} | IP: {IP} | TraceId: {TraceId} | ExceptionType: {ExceptionType} | Message: {Message}",
                requestMethod,
                requestPath,
                user,
                clientIp,
                httpContext.TraceIdentifier,
                exception.GetType().FullName,
                exception.Message);
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        var errorResponse = new
        {
            message,
            statusCode,
            timestamp = DateTime.UtcNow,
            traceId = httpContext.TraceIdentifier
        };

        await httpContext.Response.WriteAsync(JsonSerializer.Serialize(errorResponse, SerializerOptions), cancellationToken);

        return true;
    }
}
