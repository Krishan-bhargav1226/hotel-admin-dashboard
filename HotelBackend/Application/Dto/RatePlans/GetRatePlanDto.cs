using Application.Dto.CommonDtos;
using Domain.Entities.Hotels;

namespace Application.Dto.RatePlans;

public class GetRatePlanDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public PlanKind Kind { get; set; }
    public decimal Rate { get; set; }
    public int DurationHours { get; set; }
    public string? CheckoutTime { get; set; }
    public int MinHours { get; set; }
    public decimal OvertimeRate { get; set; }
    public int GraceMinutes { get; set; }
    public List<int> RoomTypeIds { get; set; } = new();
}
