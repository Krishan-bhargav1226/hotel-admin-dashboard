using System.Text.Json;

namespace HotelAdmin.Domain.Entities;

/// <summary>
/// A versioned storage bucket used by the current dashboard while its domain screens migrate to APIs.
/// </summary>
public sealed class HotelRecord
{
    private HotelRecord() { }

    public string Key { get; private set; } = string.Empty;
    public string JsonValue { get; private set; } = "null";
    public DateTimeOffset UpdatedAt { get; private set; }

    public static HotelRecord Create(string key, string jsonValue, DateTimeOffset updatedAt)
    {
        ValidateKey(key);
        ValidateJson(jsonValue);

        return new HotelRecord
        {
            Key = key,
            JsonValue = jsonValue,
            UpdatedAt = updatedAt.ToUniversalTime(),
        };
    }

    public void ReplaceValue(string jsonValue, DateTimeOffset updatedAt)
    {
        ValidateJson(jsonValue);
        JsonValue = jsonValue;
        UpdatedAt = updatedAt.ToUniversalTime();
    }

    public static bool IsValidKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key) || key.Length > 160)
            return false;

        return key.All(character => !char.IsControl(character) && character is not '/' and not '\\');
    }

    public static bool IsValidJson(string? jsonValue)
    {
        if (jsonValue is null)
            return false;

        try
        {
            using var _ = JsonDocument.Parse(jsonValue);
            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static void ValidateKey(string key)
    {
        if (!IsValidKey(key))
            throw new ArgumentException("Storage keys must be 1–160 characters and cannot contain path separators or control characters.", nameof(key));
    }

    private static void ValidateJson(string jsonValue)
    {
        if (!IsValidJson(jsonValue))
            throw new ArgumentException("Storage values must be valid JSON.", nameof(jsonValue));
    }
}
