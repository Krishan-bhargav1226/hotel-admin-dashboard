using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DutyStatus
{
    ON_DUTY = 1,
    OFF_DUTY = 2
}
