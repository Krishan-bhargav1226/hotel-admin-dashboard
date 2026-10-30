using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ReservationStatus
{
    CONFIRMED = 1,
    CHECKED_IN = 2,
    CANCELLED = 3,
    NO_SHOW = 4
}
