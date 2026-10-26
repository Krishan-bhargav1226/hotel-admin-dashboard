using Domain.Entities.Organizations;
using Domain.Entities.Roles.RoleClaims;
using Domain.Entities.Users.UserRoles;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.ApplicationRoles;

public class Role : IdentityRole
{
    public List<UserRole> UserRoles { get; set; } = [];

    [ForeignKey("Organization")]
    public int? OrganizationId { get; set; }
    public Organization? Organization { get; set; }

    public List<RoleClaim> RoleMenus { get; set; } = [];
}
