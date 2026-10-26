using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.Locations;

namespace Application.Dto.Locations;

public class GetLocationDto : IMapFrom<Location>
{
    public int Id { get; set; }
    public string Name { get; set; }
    public IdAndNameDto LocationType { get; set; }
    public string? Code { get; set; }
    public string? ShortName { get; set; }
    public int? ParentId { get; set; }
    public GetLocationDto? Parent { get; set; }
}
