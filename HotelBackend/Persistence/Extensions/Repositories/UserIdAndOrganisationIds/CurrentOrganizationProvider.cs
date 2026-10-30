using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Microsoft.AspNetCore.Http;

namespace Persistence.Extensions.Repositories.UserIdAndOrganizationIds;

public class CurrentOrganizationProvider : ICurrentOrganizationProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentOrganizationProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public List<int> GetOrganizationIds()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
            return [];

        var claimValue = httpContext.User.FindFirst("OrganizationId")?.Value;
        if (int.TryParse(claimValue, out var organizationId) && organizationId > 0)
            return [organizationId];

        return [];
    }
}
