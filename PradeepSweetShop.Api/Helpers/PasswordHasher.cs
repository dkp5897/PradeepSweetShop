using System;
using System.Security.Cryptography;

namespace PradeepSweetShop.Api.Helpers;

public static class PasswordHasher
{
    public static (string hash, string salt) HashPassword(string password)
    {
        // Generate a 128-bit salt using a cryptographically strong random number generator
        byte[] saltBytes = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(saltBytes);
        }
        string salt = Convert.ToBase64String(saltBytes);

        // Hash the password with the salt using PBKDF2 static method (non-obsolete in modern .NET)
        byte[] hashBytes = Rfc2898DeriveBytes.Pbkdf2(
            password, 
            saltBytes, 
            iterations: 100000, 
            HashAlgorithmName.SHA256, 
            outputLength: 32); // 256-bit hash

        string hash = Convert.ToBase64String(hashBytes);

        return (hash, salt);
    }

    public static bool VerifyPassword(string password, string storedHash, string storedSalt)
    {
        byte[] saltBytes = Convert.FromBase64String(storedSalt);
        byte[] storedHashBytes = Convert.FromBase64String(storedHash);

        // Hash input password with stored salt using static PBKDF2
        byte[] computedHashBytes = Rfc2898DeriveBytes.Pbkdf2(
            password, 
            saltBytes, 
            iterations: 100000, 
            HashAlgorithmName.SHA256, 
            outputLength: 32);

        // Compare hash bytes (fixed time comparison to prevent timing attacks)
        return CryptographicOperations.FixedTimeEquals(computedHashBytes, storedHashBytes);
    }
}
