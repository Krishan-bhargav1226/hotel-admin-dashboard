namespace Application.Interfaces.Services;

public sealed record LiveEntityChange(
    string EntityType,
    string? EntityId,
    string Action,
    int OrganizationId,
    int? PropertyId,
    IReadOnlyDictionary<string, object?>? Fields);

public interface ILiveUpdateBroadcaster
{
    Task BroadcastAsync(LiveEntityChange change, CancellationToken cancellationToken = default);
}

public sealed class NoOpLiveUpdateBroadcaster : ILiveUpdateBroadcaster
{
    public Task BroadcastAsync(LiveEntityChange change, CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}
