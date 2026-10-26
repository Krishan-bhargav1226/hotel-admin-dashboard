using Application.Common.Mappings.Commons;
using Application.Dto.Users.UserRoles;
using Domain.Entities.ApplicationUsers;

namespace Application.Dto.Users.GetUserDtos;

public class GetUserDto : IMapFrom<User>
{
    public string FirstName { get; set; }
    public string? LastName { get; set; }
    public string Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AppToken { get; set; }
    public string? SignalRToken { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? OtherDetails { get; set; }
    public List<GetRoleDto> Roles { get; set; } = [];
    public GetUserProfileDto UserProfile { get; set; }
    public GetUserAddressDto UserAddress { get; set; }
}
