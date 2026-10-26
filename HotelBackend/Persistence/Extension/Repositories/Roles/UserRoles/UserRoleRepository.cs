using Application.Interfaces.Repositories.Users.UserRoles;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.Users.UserRoles;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories.Roles.UserRoles;

public class UserRoleRepository : IUserRoleRepository
{
    private readonly ApplicationDbContext _context;

    public UserRoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> AddUserRole(string UserId, string RoleId)
    {
        var userRole = new UserRole
        {
            UserId = UserId,
            RoleId = RoleId
        };

        await _context.UserRoles.AddAsync(userRole);
        _context.SaveChanges();

        return true;
    }

    public async Task CreateUpdateUserRole(string userId, List<string> roles)
    {
        await DeleteExistingUserRoles(userId);

        foreach (var roleId in roles.Distinct())
        {
            var data = new UserRole
            {
                UserId = userId,
                RoleId = roleId,
            };

            await _context.UserRoles.AddAsync(data);
            await _context.SaveChangesAsync();
        }
    }
    private async Task DeleteExistingUserRoles(string userId)
    {
        var existingRoles = await _context.UserRoles.Where(x => x.UserId == userId).ToListAsync();

        _context.UserRoles.RemoveRange(existingRoles);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Role>> GetUserRole(string userId)
    {
        return await _context.UserRoles.Where(x => x.UserId == userId)
                                          .Include(x => x.Role).ThenInclude(x => x.RoleMenus).ThenInclude(x => x.Menu).ThenInclude(x => x.MenuType)
                                          .Select(x => x.Role)
                                          .ToListAsync();
    }
}
