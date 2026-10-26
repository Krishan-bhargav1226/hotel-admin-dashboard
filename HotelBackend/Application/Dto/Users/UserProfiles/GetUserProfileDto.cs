using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.UserProfiles;

namespace Application.Dto.Users;

public class GetUserProfileDto : IMapFrom<UserProfile>
{
    public string UserId { get; set; }
    public StringIdAndNameDto User { get; set; }
    public IdAndNameDto? Gender { get; set; }
    public DateOnly? DOB { get; set; }
    public IdAndNameDto? MaritalStatus { get; set; }
    public string? ProfilePicture { get; set; }
    public string? FacebookId { get; set; }
    public string? LinkedInId { get; set; }
    public string? InstagramId { get; set; }
}
