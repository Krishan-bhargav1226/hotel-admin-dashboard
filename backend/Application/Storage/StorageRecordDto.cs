namespace HotelAdmin.Application.Storage;

public sealed record StorageRecordDto(string Key, string JsonValue, DateTimeOffset UpdatedAt);
