using Application.Interfaces.GenericRepositories;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common;
using Microsoft.AspNetCore.Http;
using Persistence.DataContext;
using System.Collections;

namespace Persistence.Extension.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _contextAccessor;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private Hashtable _repository;
    private bool disposed;

    public UnitOfWork(ApplicationDbContext context, IHttpContextAccessor contextAccessor, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _context = context;
        _contextAccessor = contextAccessor;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
        }

        disposed = true;
    }

    public IGenericRepository<T> Repository<T>() where T : BaseAuditableEntity
    {
        if (_repository == null)
            _repository = new Hashtable();

        var type = typeof(T).Name;

        if (!_repository.ContainsKey(type))
        {
            var repositoryType = typeof(GenericRepository<>);
            var repositoryInstance = Activator.CreateInstance(
                repositoryType.MakeGenericType(typeof(T)), _context, _contextAccessor,_userIdAndOrganizationIdRepository);
            _repository.Add(type, repositoryInstance);
        }

        return (IGenericRepository<T>)_repository[type];
    }

    public async Task<int> Save(CancellationToken cancellationToken)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<int> SaveAndRemoveCache(CancellationToken cancellationToken, params string[] cachekeys)
    {
        throw new NotImplementedException();
    }

    public Task Rollback()
    {
        throw new NotImplementedException();
    }
}
