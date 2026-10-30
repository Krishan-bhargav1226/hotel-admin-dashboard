using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MaintenanceStatus
{
    OPEN = 1,
    IN_PROGRESS = 2,
    RESOLVED = 3
}
