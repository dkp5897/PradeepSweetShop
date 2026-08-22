using System.Net;

namespace PradeepSweetShop.Api.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string message) 
        : base(message, HttpStatusCode.NotFound)
    {
    }
}
