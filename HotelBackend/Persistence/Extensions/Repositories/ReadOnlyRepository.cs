using Application.Interfaces.GenericRepositories;
using Domain.Common;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extensions.Repositories;

public class ReadOnlyRepository<T> : IReadOnlyRepository<T> where T : BaseAuditableEntity
{
    private readonly ApplicationDbContext _context;

    public ReadOnlyRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IQueryable<T> Entities =>
        _context.Set<T>().AsNoTracking();

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await Entities.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await Entities.ToListAsync(cancellationToken);
}
