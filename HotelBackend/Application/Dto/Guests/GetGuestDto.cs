using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Application.Dto.Stays;
using Domain.Entities.Guests;

namespace Application.Dto.Guests;

public class GetGuestDto : BaseDto, IMapFrom<Guest>
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? IdType { get; set; }
    public string? IdNumber { get; set; }
    public string? Address { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public string? IdImage { get; set; }
    public List<GetStayDto> Stays { get; set; } = [];
}
