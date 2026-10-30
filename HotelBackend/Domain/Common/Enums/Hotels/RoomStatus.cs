using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomStatus
{
    AVAILABLE = 1,
    OCCUPIED = 2,
    CLEANING = 3,
    MAINTENANCE = 4
}
