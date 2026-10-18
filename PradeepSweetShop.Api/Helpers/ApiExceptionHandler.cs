using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace PradeepSweetShop.Api.Helpers;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var conflict = exception is DbUpdateConcurrencyException || exception is SqlException { Number: 1205 };
        context.Response.StatusCode = conflict ? StatusCodes.Status409Conflict : StatusCodes.Status500InternalServerError;
        if (conflict) logger.LogWarning(exception, "Concurrent update rejected.");
        else logger.LogError(exception, "Request failed. Trace {TraceId}", context.TraceIdentifier);
        await context.Response.WriteAsJsonAsync(new
        {
            message = conflict ? "This item changed while you were editing. Refresh and try again." :
                "The shop could not complete this request. Please try again.",
            traceId = context.TraceIdentifier
        }, cancellationToken);
        return true;
    }
}
