using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MenuCategory
{
    BREAKFAST = 1,
    MAIN_COURSE = 2,
    SNACKS = 3,
    BEVERAGES = 4,
    LAUNDRY = 5,
    EXTRA_SERVICE = 6
}
