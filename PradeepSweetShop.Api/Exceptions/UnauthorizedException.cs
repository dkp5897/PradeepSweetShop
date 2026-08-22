using System.Net;

namespace PradeepSweetShop.Api.Exceptions;

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Unauthorized access.") 
        : base(message, HttpStatusCode.Unauthorized)
    {
    }
}
