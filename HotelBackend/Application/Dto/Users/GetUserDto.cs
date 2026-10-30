using Application.Common.Mappings.Commons;
using Application.Dto.Users.UserRoles;
using Domain.Entities.ApplicationUsers;

namespace Application.Dto.Users.GetUserDtos;

public class GetUserDto : IMapFrom<User>
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; }
    public int OrganizationId { get; set; }
    public int? PropertyId { get; set; }
    public List<GetRoleDto> Roles { get; set; } = [];
}
