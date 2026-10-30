using Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;

namespace WebApi.Infrastructure;

public sealed class SignalRLiveUpdateBroadcaster(IHubContext<ActivityHub> hub) : ILiveUpdateBroadcaster
{
    private static readonly HashSet<string> PropertyScoped = new(StringComparer.Ordinal)
    {
        "Property", "Room", "Staff", "Stay", "Reservation", "Housekeeping", "Maintenance", "ServiceOrder", "Shift", "Expense", "LostItem"
    };

    public async Task BroadcastAsync(LiveEntityChange change, CancellationToken cancellationToken = default)
    {
        if (change.OrganizationId <= 0)
            return;

        // Broadcast to all clients connected under this organization
        await Send(ActivityHub.OrgGroup(change.OrganizationId), change, includeFields: true, cancellationToken);
        await Send(ActivityHub.SharedGroup(change.OrganizationId), change, includeFields: true, cancellationToken);

        if (change.PropertyId is int propertyId && propertyId > 0)
        {
            await Send(ActivityHub.PropertyGroup(change.OrganizationId, propertyId), change, includeFields: true, cancellationToken);
        }
    }

    private Task Send(string group, LiveEntityChange change, bool includeFields, CancellationToken cancellationToken)
    {
        var payload = new
        {
            entityType = change.EntityType,
            entityId = change.EntityId,
            action = change.Action,
            organizationId = change.OrganizationId,
            propertyId = change.PropertyId,
            fields = includeFields ? change.Fields : null,
            refetch = true
        };
        return hub.Clients.Group(group).SendAsync(ActivityHub.EntityChanged, payload, cancellationToken);
    }
}
