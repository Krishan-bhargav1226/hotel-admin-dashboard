namespace Application.Common.Helpers;

using System.Security.Cryptography;

public class RandomGenerator
{
    private const string AllowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public static string GenerateRandomString(int length = 6)
    {
        var bytes = new byte[length];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }

        char[] result = new char[length];
        for (int i = 0; i < length; i++)
        {
            result[i] = AllowedChars[bytes[i] % AllowedChars.Length];
        }

        return new string(result);
    }
}
