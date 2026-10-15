using HotelAdmin.Domain.Entities;

namespace HotelAdmin.Application.Abstractions;

public interface IHotelRecordRepository
{
    Task<IReadOnlyList<HotelRecord>> GetAllAsync(CancellationToken cancellationToken);
    Task<HotelRecord?> GetByKeyAsync(string key, CancellationToken cancellationToken);
    Task UpsertAsync(HotelRecord record, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(string key, CancellationToken cancellationToken);
    Task ReplaceAllAsync(IReadOnlyCollection<HotelRecord> records, CancellationToken cancellationToken);
    Task ClearAsync(CancellationToken cancellationToken);
}
