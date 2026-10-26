using Application.Interfaces.Repositories.Users.UserRoles.Roles;
using Domain.Entities.ApplicationRoles;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories.Roles;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;
    private readonly RoleManager<Role> _roleManager;

    public RoleRepository(ApplicationDbContext context, RoleManager<Role> roleManager)
    {
        _context = context;
        _roleManager = roleManager;
    }

    public async Task<string> GetRoleByName(string roleName, int organizationId)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower() && r.OrganizationId == organizationId);

        if (role == null)
        {
            string name = roleName;

            var newRole = new Role()
            {
                Name = name,
                OrganizationId = organizationId,
                NormalizedName = name.ToUpper()
            };
            await _roleManager.CreateAsync(newRole);
            return newRole.Id;
        }

        return role.Id;

    }
}
