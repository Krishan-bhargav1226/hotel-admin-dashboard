using Domain.Common;

namespace Application.Interfaces.GenericRepositories;

public interface IReadOnlyRepository<T> where T : BaseEntity
{
    IQueryable<T> Entities { get; }
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default);
}
