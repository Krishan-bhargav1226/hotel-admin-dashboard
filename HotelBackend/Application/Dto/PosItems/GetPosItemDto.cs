using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Common.Enums.Hotels;
using Domain.Entities.PosItems;

namespace Application.Dto.PosItems;

public class GetPosItemDto : BaseDto, IMapFrom<PosItem>
{
    public string Name { get; set; } = string.Empty;
    public MenuCategory Category { get; set; }
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
}
