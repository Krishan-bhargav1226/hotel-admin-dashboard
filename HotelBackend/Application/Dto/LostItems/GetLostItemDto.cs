using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.Hotels;
using Domain.Entities.LostItems;

namespace Application.Dto.LostItems;

public class GetLostItemDto : BaseDto, IMapFrom<LostItem>
{
    public string Title { get; set; } = string.Empty;
    public LostItemCategory Category { get; set; }
    public string? LocationFound { get; set; }
    public string? RoomNumber { get; set; }
    public DateOnly FoundDate { get; set; }
    public string? FoundTime { get; set; }
    public string? FoundByStaff { get; set; }
    public string? StorageLocker { get; set; }
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    public LostItemStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? ClaimedBy { get; set; }
    public string? ClaimantContact { get; set; }
    public string? ItemNo { get; set; }
    public DateTime? ClaimedAt { get; set; }
}
