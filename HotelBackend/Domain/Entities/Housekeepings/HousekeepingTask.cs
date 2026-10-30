using Domain.Common;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Rooms;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Housekeepings;

public class HousekeepingTask : BaseAuditableEntity
{
    [ForeignKey("Room")]
    public int RoomId { get; set; }
    public Room? Room { get; set; }

    [StringLength(20)]
    public string RoomNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string RoomTypeName { get; set; } = string.Empty;
    public HousekeepingStatus Status { get; set; } = HousekeepingStatus.DIRTY;

    [StringLength(100)]
    public string? AssignedTo { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.NORMAL;

    [StringLength(500)]
    public string? Notes { get; set; }
    public DateTime? LastCleanedAt { get; set; }
}
