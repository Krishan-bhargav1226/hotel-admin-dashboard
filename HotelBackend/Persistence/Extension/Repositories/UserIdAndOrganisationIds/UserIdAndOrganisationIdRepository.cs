using Application.Dto.GetUserIdAndOrganizationIds;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationUsers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Persistence.Extension.Repositories.UserIdAndOrganizationIds;

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
        {
            throw new InvalidOperationException("HTTP context is not available.");
        }

        var result = new GetUserIdAndOrganizationIdDto
        {
            OrganizationId = 1
        };

        var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            result.UserId = userId;

            result.IsAdmin = await _userManager.Users
                .Where(x => x.Id == userId && x.UserRoles.Any(x => x.Role.Name == "Admin"))
                .AnyAsync();

            result.IsSchool = await _userManager.Users
                .Where(x => x.Id == userId && x.UserRoles.Any(x => x.Role.Name == "School"))
                .AnyAsync();

            result.UserOrganizationId = await _userManager.Users
                .Where(x => x.Id == userId)
                .Select(x => x.OrganizationId)
                .FirstOrDefaultAsync();

        }

        if (httpContext.Request.Headers.TryGetValue("OrganizationId", out var organizationId))
        {
            result.OrganizationId = Convert.ToInt32(organizationId);
        }

        return result;
    }
}
