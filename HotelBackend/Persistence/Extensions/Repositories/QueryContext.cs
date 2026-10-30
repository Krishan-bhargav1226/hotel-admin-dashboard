using Application.Interfaces.GenericRepositories;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common;
using Persistence.DataContext;
using System.Collections;

namespace Persistence.Extensions.Repositories;

public class QueryContext : IQueryContext
{
    private readonly ApplicationDbContext _context;
    private Hashtable? _repository;

    public QueryContext(ApplicationDbContext context)
    {
        _context = context;
    }

    public IReadOnlyRepository<T> Repository<T>() where T : BaseEntity
    {
        _repository ??= new Hashtable();

        var type = typeof(T).Name;
        if (!_repository.ContainsKey(type))
        {
            var repositoryType = typeof(ReadOnlyRepository<>);
            var repositoryInstance = Activator.CreateInstance(
                repositoryType.MakeGenericType(typeof(T)), _context);
            _repository.Add(type, repositoryInstance);
        }

        return (IReadOnlyRepository<T>)_repository[type];
    }
}
