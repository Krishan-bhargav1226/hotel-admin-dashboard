using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LostItemCategory
{
    ELECTRONICS = 1,
    VALUABLES = 2,
    JEWELRY = 3,
    DOCUMENTS = 4,
    CLOTHING = 5,
    OTHER = 6
}
