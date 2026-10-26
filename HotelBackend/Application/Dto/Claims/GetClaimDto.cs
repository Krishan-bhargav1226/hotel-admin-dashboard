using Application.Common.Mappings.Commons;
using Microsoft.AspNetCore.Identity;

namespace Application.Dto.Claims;

public class GetClaimDto : IMapFrom<IdentityUserClaim<string>>
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string ClaimType { get; set; }
    public string ClaimValue { get; set; }
}
