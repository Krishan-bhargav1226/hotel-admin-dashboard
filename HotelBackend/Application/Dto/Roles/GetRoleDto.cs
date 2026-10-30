using Domain.Entities.ApplicationRoles;

namespace Application.Dto.Users.UserRoles;

public class GetRoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
