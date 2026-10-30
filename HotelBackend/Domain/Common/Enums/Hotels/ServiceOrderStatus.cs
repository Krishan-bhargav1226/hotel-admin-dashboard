using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ServiceOrderStatus
{
    PENDING = 1,
    PREPARING = 2,
    DELIVERED = 3,
    CANCELLED = 4
}
