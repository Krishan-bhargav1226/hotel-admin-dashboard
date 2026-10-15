using HotelAdmin.Application.Abstractions;
using HotelAdmin.Application.Storage.Commands;
using HotelAdmin.Application.Storage.Queries;
using HotelAdmin.Domain.Entities;
using Xunit;

namespace HotelAdmin.Tests;

public sealed class StorageHandlersTests
{
    [Fact]
    public async Task Upsert_creates_and_then_updates_a_record()
    {
        var repository = new InMemoryHotelRecordRepository();
        var clock = new FixedClock(DateTimeOffset.Parse("2026-02-01T00:00:00Z"));
        var handler = new UpsertStorageRecordHandler(repository, clock);
        await handler.Handle(new UpsertStorageRecordCommand("rooms", "[]"), CancellationToken.None);

        clock.UtcNow = clock.UtcNow.AddMinutes(1);
        await handler.Handle(new UpsertStorageRecordCommand("rooms", "[{\"id\":1}]"), CancellationToken.None);
        var stored = await new GetStorageRecordHandler(repository)
            .Handle(new GetStorageRecordQuery("rooms"), CancellationToken.None);

        Assert.NotNull(stored);
        Assert.Equal("[{\"id\":1}]", stored.JsonValue);
        Assert.Equal(clock.UtcNow, stored.UpdatedAt);
        Assert.Single(repository.Records);
    }

    [Fact]
    public async Task Replace_all_replaces_the_complete_backup_snapshot()
    {
        var repository = new InMemoryHotelRecordRepository();
        repository.Records["old"] = HotelRecord.Create("old", "true", DateTimeOffset.UtcNow);
        var handler = new ReplaceStorageRecordsHandler(repository, new FixedClock(DateTimeOffset.UtcNow));

        await handler.Handle(new ReplaceStorageRecordsCommand(new Dictionary<string, string>
        {
            ["rooms"] = "[]",
            ["img:1"] = "\"data:image/png;base64,AA==\"",
        }), CancellationToken.None);

        Assert.Equal(2, repository.Records.Count);
        Assert.DoesNotContain("old", repository.Records.Keys);
        Assert.Contains("rooms", repository.Records.Keys);
    }

    private sealed class FixedClock(DateTimeOffset utcNow) : IClock
    {
        public DateTimeOffset UtcNow { get; set; } = utcNow;
    }

    private sealed class InMemoryHotelRecordRepository : IHotelRecordRepository
    {
        public Dictionary<string, HotelRecord> Records { get; } = [];

        public Task<IReadOnlyList<HotelRecord>> GetAllAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<HotelRecord>>(Records.Values.ToArray());

        public Task<HotelRecord?> GetByKeyAsync(string key, CancellationToken cancellationToken) =>
            Task.FromResult(Records.GetValueOrDefault(key));

        public Task UpsertAsync(HotelRecord record, CancellationToken cancellationToken)
        {
            Records[record.Key] = record;
            return Task.CompletedTask;
        }

        public Task<bool> DeleteAsync(string key, CancellationToken cancellationToken) =>
            Task.FromResult(Records.Remove(key));

        public Task ReplaceAllAsync(IReadOnlyCollection<HotelRecord> records, CancellationToken cancellationToken)
        {
            Records.Clear();
            foreach (var record in records)
                Records[record.Key] = record;
            return Task.CompletedTask;
        }

        public Task ClearAsync(CancellationToken cancellationToken)
        {
            Records.Clear();
            return Task.CompletedTask;
        }
    }
}
