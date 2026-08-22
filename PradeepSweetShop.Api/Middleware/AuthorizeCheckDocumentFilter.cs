using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PradeepSweetShop.Api.Middleware;

public class AuthorizeCheckDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        // Clear root document security so public endpoints don't inherit security
        swaggerDoc.Security?.Clear();

        foreach (var apiDescription in context.ApiDescriptions)
        {
            var actionAttributes = apiDescription.CustomAttributes();
            var controllerAttributes = apiDescription.ActionDescriptor.EndpointMetadata;

            var hasAuthorize = actionAttributes.OfType<AuthorizeAttribute>().Any() ||
                               controllerAttributes.OfType<AuthorizeAttribute>().Any();

            var hasAllowAnonymous = actionAttributes.OfType<AllowAnonymousAttribute>().Any() ||
                                    controllerAttributes.OfType<AllowAnonymousAttribute>().Any();

            // Format route template to match OpenAPI path format (e.g. /api/Categories)
            var route = "/" + apiDescription.RelativePath?.TrimEnd('/');
            if (route.Contains('?'))
            {
                route = route[..route.IndexOf('?')];
            }

            if (swaggerDoc.Paths.TryGetValue(route, out var pathItem) && pathItem.Operations != null)
            {
                foreach (var (opType, operation) in pathItem.Operations)
                {
                    if (opType.ToString().Equals(apiDescription.HttpMethod, StringComparison.OrdinalIgnoreCase))
                    {
                        if (hasAuthorize && !hasAllowAnonymous)
                        {
                            operation.Responses ??= [];
                            operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });
                            operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Forbidden" });

                            operation.Security =
                            [
                                new()
                                {
                                    [new OpenApiSecuritySchemeReference("bearer", swaggerDoc)] = []
                                }
                            ];
                        }
                        else
                        {
                            // Explicitly set empty security list for public endpoints
                            operation.Security = [];
                        }
                    }
                }
            }
        }
    }
}
