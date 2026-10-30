using Domain.Common;
using Domain.Entities.Guests;
using Domain.Common.Enums.Hotels;
using Domain.Entities.RatePlans;
using Domain.Entities.Rooms;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Stays;

public class Stay : BaseAuditableEntity
{
    [Required]
    [StringLength(20)]
    public string StayNo { get; set; } = string.Empty;

    [ForeignKey("Guest")]
    public int GuestId { get; set; }
    public Guest? Guest { get; set; }

    [StringLength(150)]
    public string GuestName { get; set; } = string.Empty;

    [StringLength(20)]
    public string GuestPhone { get; set; } = string.Empty;

    [StringLength(50)]
    public string? GuestIdType { get; set; }

    [StringLength(50)]
    public string? GuestIdNumber { get; set; }
    public string? GuestIdImage { get; set; }
    public PartyType PartyType { get; set; }
    public int GuestCount { get; set; }

    [ForeignKey("Room")]
    public int RoomId { get; set; }
    public Room? Room { get; set; }

    [StringLength(100)]
    public string RoomNumber { get; set; } = string.Empty;

    [StringLength(200)]
    public string RoomTypeName { get; set; } = string.Empty;

    [ForeignKey("RatePlan")]
    public int RatePlanId { get; set; }
    public RatePlan? RatePlan { get; set; }

    [StringLength(100)]
    public string PlanName { get; set; } = string.Empty;
    public PlanKind PlanKind { get; set; }
    public decimal PlanRate { get; set; }
    public int PlanDurationHours { get; set; }

    [StringLength(10)]
    public string? PlanCheckoutTime { get; set; }
    public int PlanMinHours { get; set; }
    public decimal PlanOvertimeRate { get; set; }
    public int PlanGraceMinutes { get; set; }
    public DateTime CheckInAt { get; set; }
    public DateTime? ExpectedCheckOutAt { get; set; }
    public DateTime? CheckOutAt { get; set; }
    public StayStatus Status { get; set; } = StayStatus.ACTIVE;
    public decimal AdvanceAmount { get; set; }
    public PaymentMode AdvanceMode { get; set; }
    public decimal Discount { get; set; }
    public decimal TaxPercent { get; set; }
    public int ElapsedMinutes { get; set; }
    public int BillableHours { get; set; }

    [StringLength(200)]
    public string? BaseLabel { get; set; }
    public decimal BaseAmount { get; set; }
    public int OvertimeHours { get; set; }
    public decimal OvertimeAmount { get; set; }
    public decimal ExtraTotal { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public PaymentMode? PaymentMode { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
    public ICollection<StayRoom> StayRooms { get; set; } = new List<StayRoom>();
    public ICollection<StayCompanion> Companions { get; set; } = new List<StayCompanion>();
    public ICollection<StayCharge> Charges { get; set; } = new List<StayCharge>();
}
