using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomCategory
{
    COUPLE = 1,
    SOLO = 2,
    FAMILY = 3,
    ACCESSIBLE = 4,
    PRESIDENTIAL = 5,
    BUDGET = 6
}
