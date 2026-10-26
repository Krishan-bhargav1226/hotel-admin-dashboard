using Domain.Common;
using Domain.Entities.Hotels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.RatePlans;

public class RatePlan : BaseAuditableEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    public PlanKind Kind { get; set; }
    public decimal Rate { get; set; }
    public int DurationHours { get; set; }

    [StringLength(10)]
    public string? CheckoutTime { get; set; }
    public int MinHours { get; set; }
    public decimal OvertimeRate { get; set; }
    public int GraceMinutes { get; set; }
    public ICollection<RatePlanRoom> Rooms { get; set; } = new List<RatePlanRoom>();
}
