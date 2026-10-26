using Domain.Common.Interfaces;

namespace Application.Interfaces.GenericRepositories;

public interface IGenericRepository<T> where T : class, IEntity
{
    IQueryable<T> Entities { get; }
    Task<List<T>> GetAll();
    Task<T?> GetByID(int id);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity, int id=0);
    Task DeleteAsync(T entity);
    Task DeleteAsync(int id);
}
