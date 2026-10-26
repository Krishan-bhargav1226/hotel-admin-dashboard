using Application.Interfaces.GenericRepositories;
using Domain.Common;

namespace Application.Interfaces.UnitOfWorkRepositories;

/// <summary>
/// Write-side unit of work for CQRS command handlers only.
/// For queries, use IQueryContext.
/// </summary>
public interface IUnitOfWork
{
    IGenericRepository<T> Repository<T>() where T : BaseAuditableEntity;
    Task<int> Save(CancellationToken cancellationToken);
    Task<int> SaveAndRemoveCache(CancellationToken cancellationToken, params string[] cachekeys);
    Task Rollback();
}
