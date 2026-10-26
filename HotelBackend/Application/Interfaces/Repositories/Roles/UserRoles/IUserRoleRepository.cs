using Domain.Entities.ApplicationRoles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Repositories.Users.UserRoles;

public interface IUserRoleRepository
{
    Task<bool> AddUserRole(string UserId, string RoleId);
    Task CreateUpdateUserRole(string userId, List<string> roles);
    Task<List<Role>> GetUserRole(string userId);
}
