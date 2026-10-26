using Domain.Common.Enums.Employees;
using Domain.Commons.Enums.Users;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Application.Dto.Employees;

public class UpdateEmployeeDto
{
    // User fields
    [StringLength(50, ErrorMessage = "FirstName cannot exceed 50 characters")]
    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string? OtherDetails { get; set; }

    // Profile fields
    public Gender? Gender { get; set; }
    public DateOnly? DOB { get; set; }
    public MaritalStatus? MaritalStatus { get; set; }
    public IFormFile? ProfilePicture { get; set; }
    public string? FacebookId { get; set; }
    public string? LinkedInId { get; set; }
    public string? InstagramId { get; set; }

    // Address fields
    public string? Address1 { get; set; }
    public string? Address2 { get; set; }
    public int? CityId { get; set; }
    public int? StateId { get; set; }
    public int? CountryId { get; set; }
    public int? PinCode { get; set; }
    public List<string> RoleIds { get; set; } = new();
}
