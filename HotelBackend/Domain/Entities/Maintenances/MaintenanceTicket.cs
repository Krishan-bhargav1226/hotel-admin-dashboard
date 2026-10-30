using Domain.Common;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Rooms;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Maintenances;

public class MaintenanceTicket : BaseAuditableEntity
{
    [Required]
    [StringLength(20)]
    public string TicketNo { get; set; } = string.Empty;

    [ForeignKey("Room")]
    public int RoomId { get; set; }
    public Room? Room { get; set; }

    [StringLength(20)]
    public string RoomNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.MEDIUM;
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.OPEN;

    [StringLength(100)]
    public string? ReportedBy { get; set; }

    [StringLength(100)]
    public string? AssignedTo { get; set; }
    public decimal Cost { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
