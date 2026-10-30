using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Common.Enums.Hotels;
using Domain.Entities.RoomTypes;

namespace Application.Dto.RoomTypes;

public class GetRoomTypeDto : BaseDto, IMapFrom<RoomType>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Images { get; set; }
    public RoomCategory Category { get; set; }
    public string? SuitableFor { get; set; }
    public string? BedConfig { get; set; }
    public int MaxGuests { get; set; }
    public int SizeSqFt { get; set; }
    public decimal BasePrice { get; set; }
    public string? Amenities { get; set; }
    public string? Badge { get; set; }
    public string? Image { get; set; }
}
