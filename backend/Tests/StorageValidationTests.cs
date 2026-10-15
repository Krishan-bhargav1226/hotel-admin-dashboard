using HotelAdmin.Application.Storage.Commands;
using Xunit;

namespace HotelAdmin.Tests;

public sealed class StorageValidationTests
{
    [Theory]
    [InlineData("", "[]")]
    [InlineData("../private", "[]")]
    [InlineData("rooms", "not-json")]
    public void Upsert_validator_rejects_invalid_keys_or_json(string key, string json)
    {
        var result = new UpsertStorageRecordCommandValidator()
            .Validate(new UpsertStorageRecordCommand(key, json));

        Assert.False(result.IsValid);
    }

    [Fact]
    public void Upsert_validator_accepts_the_dashboard_image_payloads()
    {
        var result = new UpsertStorageRecordCommandValidator()
            .Validate(new UpsertStorageRecordCommand("img:photo-1", "\"data:image/png;base64,AA==\""));

        Assert.True(result.IsValid);
    }
}
