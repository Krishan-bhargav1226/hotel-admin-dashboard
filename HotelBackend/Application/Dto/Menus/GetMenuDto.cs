using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.Menus;

namespace Application.Dto.Menus;

public class GetMenuDto : IMapFrom<Menu>
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string URL { get; set; }
    public string Icon { get; set; }
    public string ImageURL { get; set; }
    public Guid ParentId { get; set; }
    public int? MenuTypeId { get; set; }
    public IdAndNameDto MenuType { get; set; }
}
