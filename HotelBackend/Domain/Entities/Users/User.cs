using Domain.Common.Enums.Users;
using Domain.Entities.Organizations;
using Domain.Entities.UserAddresses;
using Domain.Entities.UserProfiles;
using Domain.Entities.Users.UserRoles;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.ApplicationUsers;

public class User : IdentityUser
{
    public string FirstName { get; set; }
    public string? LastName { get; set; }

    [DataType(DataType.PhoneNumber)]
    [MaxLength(20)]
    public override string? PhoneNumber { get; set; }

    public string? AppToken { get; set; }
    public string? SignalRToken { get; set; }
    public UserType UserType { get; set; }

    [ForeignKey("Organization")]
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; }

    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public string? OtherDetails { get; set; }
    public List<UserRole> UserRoles { get; set; }
    public UserProfile UserProfile { get; set; }
    public UserAddress UserAddress { get; set; }
}