using System.Net;

namespace PradeepSweetShop.Api.Exceptions;

public class BadRequestException : AppException
{
    public BadRequestException(string message) 
        : base(message, HttpStatusCode.BadRequest)
    {
    }
}
