using Domain.Common;
using Domain.Entities.Hotels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.RoomTypes;

public class RoomType : BaseAuditableEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
    public string? Image { get; set; }
    public string? Images { get; set; }
    public RoomCategory Category { get; set; }

    [StringLength(100)]
    public string? SuitableFor { get; set; }

    [StringLength(100)]
    public string? BedConfig { get; set; }
    public int MaxGuests { get; set; }
    public int SizeSqFt { get; set; }
    public decimal BasePrice { get; set; }

    [StringLength(1000)]
    public string? Amenities { get; set; }

    [StringLength(50)]
    public string? Badge { get; set; }
}
