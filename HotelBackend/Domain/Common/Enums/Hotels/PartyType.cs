using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PartyType
{
    SOLO = 1,
    COUPLE = 2,
    FAMILY = 3
}
