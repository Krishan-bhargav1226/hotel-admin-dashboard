using Domain.Entities.Expenses;
using Domain.Entities.Notifications;
using Domain.Entities.Guests;
using Domain.Entities.HotelSettings;
using Domain.Entities.HotelStaffs;
using Domain.Entities.Housekeepings;
using Domain.Entities.LostItems;
using Domain.Entities.Maintenances;
using Domain.Entities.NightAudits;
using Domain.Entities.PosItems;
using Domain.Entities.Properties;
using Domain.Entities.RatePlans;
using Domain.Entities.Reservations;
using Domain.Entities.Rooms;
using Domain.Entities.RoomTypes;
using Domain.Entities.ServiceOrders;
using Domain.Entities.Shifts;
using Domain.Entities.Stays;
using Microsoft.EntityFrameworkCore;

namespace Persistence.DataContext;

public partial class ApplicationDbContext
{
    public DbSet<HotelProperty> HotelProperties { get; set; }
    public DbSet<AdminNotification> AdminNotifications { get; set; }
    public DbSet<HotelSetting> HotelSettings { get; set; }
    public DbSet<RoomType> RoomTypes { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<RatePlan> RatePlans { get; set; }
    public DbSet<RatePlanRoom> RatePlanRooms { get; set; }
    public DbSet<Guest> Guests { get; set; }
    public DbSet<Stay> Stays { get; set; }
    public DbSet<StayRoom> StayRooms { get; set; }
    public DbSet<StayCompanion> StayCompanions { get; set; }
    public DbSet<StayCharge> StayCharges { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
    public DbSet<HousekeepingTask> HousekeepingTasks { get; set; }
    public DbSet<MaintenanceTicket> MaintenanceTickets { get; set; }
    public DbSet<PosItem> PosItems { get; set; }
    public DbSet<ServiceOrder> ServiceOrders { get; set; }
    public DbSet<ServiceOrderLine> ServiceOrderLines { get; set; }
    public DbSet<HotelStaff> HotelStaffs { get; set; }
    public DbSet<ShiftRegister> ShiftRegisters { get; set; }
    public DbSet<HotelExpense> HotelExpenses { get; set; }
    public DbSet<NightAudit> NightAudits { get; set; }
    public DbSet<LostItem> LostItems { get; set; }

    private void ConfigureHotelEntities(ModelBuilder modelBuilder)
    {
        var hotelNamespaces = new HashSet<string>
        {
            "Domain.Entities.Properties",
            "Domain.Entities.HotelSettings",
            "Domain.Entities.RoomTypes",
            "Domain.Entities.Rooms",
            "Domain.Entities.RatePlans",
            "Domain.Entities.Guests",
            "Domain.Entities.Stays",
            "Domain.Entities.Reservations",
            "Domain.Entities.Housekeepings",
            "Domain.Entities.Maintenances",
            "Domain.Entities.PosItems",
            "Domain.Entities.ServiceOrders",
            "Domain.Entities.HotelStaffs",
            "Domain.Entities.Shifts",
            "Domain.Entities.Expenses",
            "Domain.Entities.NightAudits",
            "Domain.Entities.LostItems"
        };

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (entityType.ClrType.Namespace == null || !hotelNamespaces.Contains(entityType.ClrType.Namespace))
                continue;

            foreach (var foreignKey in entityType.GetForeignKeys())
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;

            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
                    modelBuilder.Entity(entityType.ClrType).Property(property.Name).HasPrecision(18, 2);
            }
        }

        modelBuilder.Entity<Room>()
            .HasIndex(x => new { x.OrganizationId, x.Number })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = FALSE");

        modelBuilder.Entity<Guest>()
            .HasIndex(x => new { x.OrganizationId, x.Phone })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = FALSE");

        modelBuilder.Entity<HotelSetting>()
            .HasIndex(x => x.OrganizationId)
            .IsUnique()
            .HasFilter("\"IsDeleted\" = FALSE");

        modelBuilder.Entity<NightAudit>()
            .HasIndex(x => new { x.OrganizationId, x.BusinessDate })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = FALSE");

        modelBuilder.Entity<Stay>()
            .HasIndex(x => new { x.OrganizationId, x.StayNo })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = FALSE");

        modelBuilder.Entity<Reservation>()
            .HasIndex(x => new { x.OrganizationId, x.BookingNo })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = FALSE");
    }
}
