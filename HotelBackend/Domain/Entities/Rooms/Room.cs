using Domain.Common;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Properties;
using Domain.Entities.RoomTypes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Rooms;

public class Room : BaseAuditableEntity
{
    [Required]
    [StringLength(20)]
    public string Number { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Floor { get; set; }

    [ForeignKey("RoomType")]
    public int RoomTypeId { get; set; }
    public RoomType? RoomType { get; set; }
    public RoomStatus Status { get; set; } = RoomStatus.AVAILABLE;

    [StringLength(500)]
    public string? Notes { get; set; }
    public string? Image { get; set; }
    public string? Images { get; set; }

    [StringLength(50)]
    public string? BedType { get; set; }
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

    [ForeignKey("Property")]
    public int? PropertyId { get; set; }
    public HotelProperty? Property { get; set; }
}
