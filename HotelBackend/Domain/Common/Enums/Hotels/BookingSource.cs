using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum BookingSource
{
    DIRECT_WALKIN = 1,
    PHONE = 2,
    WEBSITE = 3,
    BOOKING_COM = 4,
    AGODA = 5,
    MAKEMYTRIP = 6,
    CORPORATE = 7
}
