using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ShiftType
{
    MORNING = 1,
    EVENING = 2,
    NIGHT = 3,
    FULL_DAY = 4
}
