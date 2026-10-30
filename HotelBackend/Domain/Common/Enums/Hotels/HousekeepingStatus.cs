using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum HousekeepingStatus
{
    DIRTY = 1,
    CLEANING = 2,
    CLEAN_INSPECTED = 3,
    OUT_OF_ORDER = 4
}
