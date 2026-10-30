using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Properties;

namespace Application.Dto.Properties;

public class GetPropertyDto : BaseDto, IMapFrom<HotelProperty>
{
    public string Name { get; set; } = string.Empty;
    public string? Chain { get; set; }
    public string? BrandTier { get; set; }
    public string? Location { get; set; }
    public string? StarRating { get; set; }
    public int RoomCount { get; set; }
    public decimal OccupancyRate { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Gstin { get; set; }
    public string? UpiId { get; set; }
    public decimal DailyRevenue { get; set; }
    public decimal Adr { get; set; }
    public string? ManagerName { get; set; }
    public PropertyStatus Status { get; set; }
}
