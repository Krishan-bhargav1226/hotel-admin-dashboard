using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum StayStatus
{
    ACTIVE = 1,
    COMPLETED = 2
}
