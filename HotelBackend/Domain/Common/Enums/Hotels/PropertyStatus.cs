using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PropertyStatus
{
    ACTIVE = 1,
    INACTIVE = 2,
    MAINTENANCE = 3
}
