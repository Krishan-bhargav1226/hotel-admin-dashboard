using Domain.Common;
using Domain.Common.Enums.Employees;
using Domain.Commons.Enums.Users;
using Domain.Entities.ApplicationUsers;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.UserProfiles;

public class UserProfile : BaseAuditableEntity
{
    [ForeignKey("User")]
    public string UserId { get; set; }
    public User User { get; set; }
    public Gender? Gender { get; set; }
    public DateOnly? DOB { get; set; }
    public MaritalStatus? MaritalStatus { get; set; }
    public string? ProfilePicture { get; set; }
    public string? FacebookId { get; set; }
    public string? LinkedInId { get; set; }
    public string? InstagramId { get; set; }
}
