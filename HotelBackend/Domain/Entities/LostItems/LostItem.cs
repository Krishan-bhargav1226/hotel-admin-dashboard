using Domain.Common;
using Domain.Entities.Hotels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.LostItems;

public class LostItem : BaseAuditableEntity
{
    [Required]
    [StringLength(20)]
    public string ItemNo { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;
    public LostItemCategory Category { get; set; }

    [StringLength(150)]
    public string? LocationFound { get; set; }

    [StringLength(20)]
    public string? RoomNumber { get; set; }
    public DateOnly FoundDate { get; set; }

    [StringLength(10)]
    public string? FoundTime { get; set; }

    [StringLength(100)]
    public string? FoundByStaff { get; set; }

    [StringLength(50)]
    public string? StorageLocker { get; set; }

    [StringLength(150)]
    public string? GuestName { get; set; }

    [StringLength(20)]
    public string? GuestPhone { get; set; }
    public LostItemStatus Status { get; set; } = LostItemStatus.SECURED;

    [StringLength(500)]
    public string? Notes { get; set; }
    public DateTime? ClaimedAt { get; set; }

    [StringLength(150)]
    public string? ClaimedBy { get; set; }

    [StringLength(50)]
    public string? ClaimantContact { get; set; }
}
