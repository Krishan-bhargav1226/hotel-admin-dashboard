using Domain.Common;
using Domain.Entities.Hotels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.Properties;

public class HotelProperty : BaseAuditableEntity
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(150)]
    public string? Chain { get; set; }

    [StringLength(50)]
    public string? BrandTier { get; set; }

    [StringLength(150)]
    public string? Location { get; set; }

    [StringLength(20)]
    public string? StarRating { get; set; }
    public int RoomCount { get; set; }
    public decimal OccupancyRate { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }

    [StringLength(20)]
    public string? Gstin { get; set; }

    [StringLength(100)]
    public string? UpiId { get; set; }
    public decimal DailyRevenue { get; set; }
    public decimal Adr { get; set; }

    [StringLength(100)]
    public string? ManagerName { get; set; }
    public PropertyStatus Status { get; set; } = PropertyStatus.ACTIVE;
}
