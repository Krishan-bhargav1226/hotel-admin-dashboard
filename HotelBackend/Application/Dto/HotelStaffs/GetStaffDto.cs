using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.HotelStaffs;
using Domain.Entities.Hotels;

namespace Application.Dto.HotelStaffs;

public class GetStaffDto : BaseDto, IMapFrom<HotelStaff>
{
    public string Name { get; set; } = string.Empty;
    public StaffRole Role { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public ShiftType Shift { get; set; }
    public DutyStatus DutyStatus { get; set; }
    public DateOnly JoinedDate { get; set; }
    public int? PropertyId { get; set; }
    public string? PropertyName { get; set; }
}
