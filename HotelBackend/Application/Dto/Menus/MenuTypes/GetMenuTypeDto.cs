using Application.Common.Mappings.Commons;
using Domain.Entities.MenuTypes;

namespace Application.Dto.MenuTypes;

public class GetMenuTypeDto : IMapFrom<MenuType>
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Icon { get; set; }
}
