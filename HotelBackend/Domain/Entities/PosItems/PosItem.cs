using Domain.Common;
using Domain.Common.Enums.Hotels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.PosItems;

public class PosItem : BaseAuditableEntity
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;
    public MenuCategory Category { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;

    [StringLength(500)]
    public string? Description { get; set; }
}
