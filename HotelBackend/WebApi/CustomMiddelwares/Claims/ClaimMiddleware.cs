using Domain.Entities.ApplicationUsers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace WebApi.CustomMiddlewares.Claims;

public class ClaimMiddleware
{
    private readonly RequestDelegate _next;

    public ClaimMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext _dbContext, UserManager<User> _userManager)
    {
        var path = context.Request.Path.Value?.ToLower();

        if (path.StartsWith("/swagger") || path.StartsWith("/api-docs") || path.StartsWith("/index.html"))
        {
            await _next(context);
            return;
        }

        var endpoint = context.GetEndpoint();

        var allowAnonymous = endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>() != null;

        if (allowAnonymous)
        {
            await _next(context);
            return;
        }

        var user = context.User;

        if (user?.Identity is not { IsAuthenticated: true })
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Unauthorized: User not authenticated.");
            return;
        }

        var userId = _userManager.GetUserId(user);

        if (string.IsNullOrEmpty(userId))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("Forbidden: User ID not found.");
            return;
        }

        var isAdmin = await _userManager.Users
            .Where(x => x.Id == userId && x.UserRoles.Any(x => x.Role.Name == "Admin"))
            .AnyAsync();

        if (isAdmin)
        {
            await _next(context);
            return;
        }


        var actionDescriptor = endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor>();
        if (actionDescriptor == null)
        {
            await _next(context);
            return;
        }

        var controllerName = actionDescriptor.ControllerName;
        var actionName = actionDescriptor.ActionName;
        var requiredClaim = $"{controllerName}.{actionName}";


        var userHasClaim = await _dbContext.UserClaims
            .AnyAsync(c => c.UserId == userId && c.ClaimValue == requiredClaim);

        var userRoles = await _userManager.GetRolesAsync(await _userManager.FindByIdAsync(userId));
        var roleIds = await _dbContext.Roles
                .Where(r => userRoles.Contains(r.Name))
                .Select(r => r.Id)
                .ToListAsync();

        var roleHasClaim = await _dbContext.RoleClaims
            .AnyAsync(rc => roleIds.Contains(rc.RoleId) && rc.ClaimValue == requiredClaim);

        if (!userHasClaim && !roleHasClaim)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("Forbidden: Missing required claims.");
            return;
        }

        await _next(context);
    }
}
