using Domain.Entities.ApplicationRoles;
using Microsoft.AspNetCore.Identity;

namespace Domain.Entities.Roles.RoleClaims;

public class RoleClaim : IdentityRoleClaim<string>
{
    public Role Role { get; set; } = null!;
}
