using Application.Dto.CommonDtos;
using Domain.Entities.Hotels;
using Domain.Entities.Rooms;

namespace Application.Dto.Rooms;

public class GetRoomDto : BaseDto
{
    public string Number { get; set; } = string.Empty;
    public string? Floor { get; set; }
    public int RoomTypeId { get; set; }
    public RoomStatus Status { get; set; }
    public string? Notes { get; set; }
    public string? Images { get; set; }
    public string? BedType { get; set; }
    public RoomCategory Category { get; set; }
    public string? SuitableFor { get; set; }
    public string? BedConfig { get; set; }
    public int MaxGuests { get; set; }
    public int SizeSqFt { get; set; }
    public decimal BasePrice { get; set; }
    public string? Amenities { get; set; }
    public string? Badge { get; set; }
    public int? PropertyId { get; set; }
    public string? Image { get; set; }
    public string? RoomTypeName { get; set; }
    public string? PropertyName { get; set; }
}
