using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Microsoft.AspNetCore.Identity;

namespace Domain.Entities.Users.UserRoles;

public class UserRole : IdentityUserRole<string>
{
    public User User { get; set; }
    public Role Role { get; set; }
}
