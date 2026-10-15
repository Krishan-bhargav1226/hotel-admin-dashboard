using HotelAdmin.Application.Abstractions;
using HotelAdmin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelAdmin.Persistence;

public sealed class HotelRecordRepository(HotelDbContext dbContext) : IHotelRecordRepository
{
    public async Task<IReadOnlyList<HotelRecord>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.HotelRecords.AsNoTracking().OrderBy(record => record.Key).ToListAsync(cancellationToken);

    public Task<HotelRecord?> GetByKeyAsync(string key, CancellationToken cancellationToken) =>
        dbContext.HotelRecords.SingleOrDefaultAsync(record => record.Key == key, cancellationToken);

    public async Task UpsertAsync(HotelRecord record, CancellationToken cancellationToken)
    {
        var tracked = dbContext.HotelRecords.Local.FirstOrDefault(item => item.Key == record.Key);
        if (tracked is null && dbContext.Entry(record).State == EntityState.Detached)
        {
            tracked = await dbContext.HotelRecords.FindAsync([record.Key], cancellationToken);
            if (tracked is null)
                await dbContext.HotelRecords.AddAsync(record, cancellationToken);
            else
                dbContext.Entry(tracked).CurrentValues.SetValues(record);
        }
        else if (tracked is not null && !ReferenceEquals(tracked, record))
        {
            dbContext.Entry(tracked).CurrentValues.SetValues(record);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(string key, CancellationToken cancellationToken)
    {
        var record = await dbContext.HotelRecords.FindAsync([key], cancellationToken);
        if (record is null)
            return false;

        dbContext.HotelRecords.Remove(record);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task ReplaceAllAsync(IReadOnlyCollection<HotelRecord> records, CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        await dbContext.HotelRecords.ExecuteDeleteAsync(cancellationToken);
        await dbContext.HotelRecords.AddRangeAsync(records, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    public async Task ClearAsync(CancellationToken cancellationToken)
    {
        await dbContext.HotelRecords.ExecuteDeleteAsync(cancellationToken);
    }
}
