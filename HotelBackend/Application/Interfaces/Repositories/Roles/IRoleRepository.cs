namespace Application.Interfaces.Repositories.Users.UserRoles.Roles;

public interface IRoleRepository
{
    Task<string> GetRoleByName(string roleName, int organizationId);
}
