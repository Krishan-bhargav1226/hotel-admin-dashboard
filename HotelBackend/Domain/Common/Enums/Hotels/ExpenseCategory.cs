using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ExpenseCategory
{
    GROCERY_KITCHEN = 1,
    UTILITIES_ELECTRICITY = 2,
    LAUNDRY_SUPPLIES = 3,
    MAINTENANCE_PARTS = 4,
    FUEL_GENERATOR = 5,
    STAFF_WELFARE = 6,
    OTHER = 7
}
