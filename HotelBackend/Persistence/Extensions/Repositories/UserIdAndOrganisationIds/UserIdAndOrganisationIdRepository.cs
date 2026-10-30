using Application.Dto.GetUserIdAndOrganizationIds;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationUsers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Persistence.Extensions.Repositories.UserIdAndOrganizationIds;

public class UserIdAndOrganizationIdRepository : IUserIdAndOrganizationIdRepository
{
    private readonly UserManager<User> _userManager;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserIdAndOrganizationIdRepository(UserManager<User> userManager, IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<GetUserIdAndOrganizationIdDto> Get()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
            throw new InvalidOperationException("HTTP context is not available.");

        var result = new GetUserIdAndOrganizationIdDto
        {
            OrganizationId = 1
        };

        var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? httpContext.User.FindFirst("id")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            result.UserId = userId;

            var user = await _userManager.Users
                .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user != null)
            {
                result.UserOrganizationId = user.OrganizationId;
                result.OrganizationId = user.OrganizationId;
                result.PropertyId = user.PropertyId;
                result.IsSuperAdmin = user.UserRoles.Any(x => x.Role.Name == "SuperAdmin");
                result.IsAdmin = result.IsSuperAdmin || user.UserRoles.Any(x => x.Role.Name == "Admin");
            }
        }

        var claimOrganization = httpContext.User.FindFirst("OrganizationId")?.Value;
        if (int.TryParse(claimOrganization, out var claimOrganizationId) && claimOrganizationId > 0)
            result.OrganizationId = claimOrganizationId;

        return result;
    }
}
