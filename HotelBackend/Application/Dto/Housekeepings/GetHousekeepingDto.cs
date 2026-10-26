using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.Hotels;
using Domain.Entities.Housekeepings;

namespace Application.Dto.Housekeepings;

public class GetHousekeepingDto : BaseDto, IMapFrom<HousekeepingTask>
{
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public HousekeepingStatus Status { get; set; }
    public string? AssignedTo { get; set; }
    public TaskPriority Priority { get; set; }
    public string? Notes { get; set; }
    public DateTime? LastCleanedAt { get; set; }
}
