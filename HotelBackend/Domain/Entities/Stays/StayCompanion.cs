using Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Stays;

public class StayCompanion : BaseAuditableEntity
{
    [ForeignKey("Stay")]
    public int StayId { get; set; }
    public Stay? Stay { get; set; }

    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(50)]
    public string? IdType { get; set; }

    [StringLength(50)]
    public string? IdNumber { get; set; }
    public string? IdImage { get; set; }
}
