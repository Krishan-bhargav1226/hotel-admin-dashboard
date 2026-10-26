using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Stays;

public class StayCharge : BaseAuditableEntity
{
    [ForeignKey("Stay")]
    public int StayId { get; set; }
    public Stay? Stay { get; set; }

    [StringLength(150)]
    public string Label { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
