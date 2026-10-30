using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Application.Interfaces.Services;

[Authorize]
public class ActivityHub : Hub
{
    public const string EntityChanged = "EntityChanged";

    public static string OrgGroup(int organizationId) => $"org:{organizationId}";

    public static string SharedGroup(int organizationId) => $"org:{organizationId}:shared";

    public static string PropertyGroup(int organizationId, int propertyId) => $"org:{organizationId}:property:{propertyId}";

    public override async Task OnConnectedAsync()
    {
        if (int.TryParse(Context.User?.FindFirst("OrganizationId")?.Value, out var organizationId) && organizationId > 0)
        {
            // All members of an organization join the tenant's org & shared groups to receive live entity updates
            await Groups.AddToGroupAsync(Context.ConnectionId, OrgGroup(organizationId));
            await Groups.AddToGroupAsync(Context.ConnectionId, SharedGroup(organizationId));

            if (int.TryParse(Context.User?.FindFirst("PropertyId")?.Value, out var propertyId) && propertyId > 0)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, PropertyGroup(organizationId, propertyId));
            }
        }

        await base.OnConnectedAsync();
    }

    public async Task JoinProperty(int propertyId)
    {
        if (int.TryParse(Context.User?.FindFirst("OrganizationId")?.Value, out var organizationId) && organizationId > 0 && propertyId > 0)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, PropertyGroup(organizationId, propertyId));
        }
    }

    public async Task LeaveProperty(int propertyId)
    {
        if (int.TryParse(Context.User?.FindFirst("OrganizationId")?.Value, out var organizationId) && organizationId > 0 && propertyId > 0)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, PropertyGroup(organizationId, propertyId));
        }
    }

    public string GetConnectionId() => Context.ConnectionId;

    private static bool IsSuperAdmin(ClaimsPrincipal? user)
    {
        if (user == null)
            return false;
        if (user.IsInRole("SuperAdmin"))
            return true;
        return string.Equals(user.FindFirst("Role")?.Value, "SuperAdmin", StringComparison.OrdinalIgnoreCase);
    }
}
