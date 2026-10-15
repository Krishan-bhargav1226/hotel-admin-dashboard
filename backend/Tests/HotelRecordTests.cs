using HotelAdmin.Domain.Entities;
using Xunit;

namespace HotelAdmin.Tests;

public sealed class HotelRecordTests
{
    [Theory]
    [InlineData("rooms", "[]")]
    [InlineData("img:photo-1", "\"data:image/png;base64,AA==\"")]
    [InlineData("settings", "null")]
    public void Create_accepts_dashboard_keys_and_json_values(string key, string json)
    {
        var created = HotelRecord.Create(key, json, DateTimeOffset.Parse("2026-01-01T12:00:00+05:30"));

        Assert.Equal(key, created.Key);
        Assert.Equal(json, created.JsonValue);
        Assert.Equal(TimeSpan.Zero, created.UpdatedAt.Offset);
    }

    [Theory]
    [InlineData("", "[]")]
    [InlineData("../secrets", "[]")]
    [InlineData("bad\\key", "[]")]
    [InlineData("rooms", "not-json")]
    public void Create_rejects_invalid_storage_values(string key, string json)
    {
        Assert.Throws<ArgumentException>(() => HotelRecord.Create(key, json, DateTimeOffset.UtcNow));
    }
}
