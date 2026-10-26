using Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.Guests;

public class Guest : BaseAuditableEntity
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [StringLength(50)]
    public string? IdType { get; set; }

    [StringLength(50)]
    public string? IdNumber { get; set; }
    public string? IdImage { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }
    public bool IsFlagged { get; set; }

    [StringLength(300)]
    public string? FlagReason { get; set; }
}
