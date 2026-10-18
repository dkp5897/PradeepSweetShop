using System.Text.RegularExpressions;

namespace PradeepSweetShop.Api.Helpers;

public static partial class PhoneNumbers
{
    public static string? Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input) || !AllowedCharacters().IsMatch(input)) return null;
        var number = input.Replace(" ", "").Replace("-", "");
        if (number.StartsWith("+91")) number = number[3..];
        else if (number.Length == 12 && number.StartsWith("91")) number = number[2..];
        return Mobile().IsMatch(number) ? number : null;
    }

    [GeneratedRegex(@"^\+?[0-9 -]+$")]
    private static partial Regex AllowedCharacters();
    [GeneratedRegex(@"^[6-9][0-9]{9}$")]
    private static partial Regex Mobile();
}
