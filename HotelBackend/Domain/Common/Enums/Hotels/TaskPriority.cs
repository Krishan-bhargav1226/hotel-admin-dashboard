using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaskPriority
{
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    RUSH = 4
}
