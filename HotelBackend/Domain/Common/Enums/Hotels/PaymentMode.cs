using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentMode
{
    CASH = 1,
    UPI = 2,
    CARD = 3
}
