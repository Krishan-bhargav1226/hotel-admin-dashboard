using Application.Common.Mappings.Commons;
using Application.Dto.Menus;
using Domain.Entities.ApplicationRoles;

namespace Application.Dto.Users.UserRoles;

public class GetRoleDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<GetMenuDto> Menus { get; set; } = [];
}
