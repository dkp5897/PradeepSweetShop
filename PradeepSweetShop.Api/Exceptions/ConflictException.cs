using System.Net;

namespace PradeepSweetShop.Api.Exceptions;

public class ConflictException : AppException
{
    public ConflictException(string message) 
        : base(message, HttpStatusCode.Conflict)
    {
    }
}
