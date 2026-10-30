using Domain.Common;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Properties;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.HotelStaffs;

public class HotelStaff : BaseAuditableEntity
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;
    public StaffRole Role { get; set; }

    [Required]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [StringLength(150)]
    public string? Email { get; set; }
    public ShiftType Shift { get; set; }
    public DutyStatus DutyStatus { get; set; } = DutyStatus.OFF_DUTY;
    public DateOnly JoinedDate { get; set; }

    [ForeignKey("Property")]
    public int? PropertyId { get; set; }
    public HotelProperty? Property { get; set; }

    [StringLength(150)]
    public string? PropertyName { get; set; }
}
