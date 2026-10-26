using Application.Interfaces.GenericRepositories;
using Domain.Common;

namespace Application.Interfaces.UnitOfWorkRepositories;

public interface IQueryContext
{
    IReadOnlyRepository<T> Repository<T>() where T : BaseEntity;
}
