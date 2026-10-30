using System.Text.Json.Serialization;

namespace Domain.Common.Enums.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum StaffRole
{
    SUPER_ADMIN = 1,
    ADMIN = 2,
    MANAGER = 3,
    RECEPTIONIST = 4,
    HOUSEKEEPING = 5,
    CHEF = 6,
    MAINTENANCE = 7
}
