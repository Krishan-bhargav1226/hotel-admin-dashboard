using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PlanKind
{
    HOURLY = 1,
    FIXED = 2,
    TILL_TIME = 3
}
