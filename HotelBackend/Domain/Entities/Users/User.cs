using Domain.Common.Enums.Users;
using Domain.Entities.Organizations;
using Domain.Entities.Properties;
using Domain.Entities.Users.UserRoles;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.ApplicationUsers;

public class User : IdentityUser
{
    [Required]
    [StringLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(50)]
    public string? LastName { get; set; }

    [DataType(DataType.PhoneNumber)]
    [MaxLength(20)]
    public override string? PhoneNumber { get; set; }
    public UserType UserType { get; set; }

    [ForeignKey(nameof(Organization))]
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;

    public int? PropertyId { get; set; }
    public HotelProperty? Property { get; set; }
    public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public List<UserRole> UserRoles { get; set; } = [];
}
