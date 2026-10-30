using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LostItemStatus
{
    SECURED = 1,
    GUEST_NOTIFIED = 2,
    CLAIMED = 3,
    DISPOSED = 4
}
