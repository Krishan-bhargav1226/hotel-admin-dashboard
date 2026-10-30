using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MaintenancePriority
{
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    EMERGENCY = 4
}
