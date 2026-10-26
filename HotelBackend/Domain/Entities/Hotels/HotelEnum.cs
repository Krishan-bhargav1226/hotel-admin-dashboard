using System.Text.Json.Serialization;

namespace Domain.Entities.Hotels;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomStatus
{
    AVAILABLE = 1,
    OCCUPIED = 2,
    CLEANING = 3,
    MAINTENANCE = 4
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PlanKind
{
    HOURLY = 1,
    FIXED = 2,
    TILL_TIME = 3
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PaymentMode
{
    CASH = 1,
    UPI = 2,
    CARD = 3
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum StayStatus
{
    ACTIVE = 1,
    COMPLETED = 2
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PartyType
{
    SOLO = 1,
    COUPLE = 2,
    FAMILY = 3
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomCategory
{
    COUPLE = 1,
    SOLO = 2,
    FAMILY = 3,
    ACCESSIBLE = 4,
    PRESIDENTIAL = 5,
    BUDGET = 6
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ReservationStatus
{
    CONFIRMED = 1,
    CHECKED_IN = 2,
    CANCELLED = 3,
    NO_SHOW = 4
}

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

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum HousekeepingStatus
{
    DIRTY = 1,
    CLEANING = 2,
    CLEAN_INSPECTED = 3,
    OUT_OF_ORDER = 4
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaskPriority
{
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    RUSH = 4
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MaintenancePriority
{
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    EMERGENCY = 4
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MaintenanceStatus
{
    OPEN = 1,
    IN_PROGRESS = 2,
    RESOLVED = 3
}

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

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ServiceOrderStatus
{
    PENDING = 1,
    PREPARING = 2,
    DELIVERED = 3,
    CANCELLED = 4
}

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

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ShiftType
{
    MORNING = 1,
    EVENING = 2,
    NIGHT = 3,
    FULL_DAY = 4
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum DutyStatus
{
    ON_DUTY = 1,
    OFF_DUTY = 2
}

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

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PropertyStatus
{
    ACTIVE = 1,
    INACTIVE = 2,
    MAINTENANCE = 3
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum LostItemStatus
{
    SECURED = 1,
    GUEST_NOTIFIED = 2,
    CLAIMED = 3,
    DISPOSED = 4
}

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
