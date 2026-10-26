using Application.Interfaces.Repositories.Organization;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories.Organization;

public class OrganizationRepository : IOrganizationRepository
{
    private readonly ApplicationDbContext _context;

    public OrganizationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(int organizationId, CancellationToken cancellationToken = default)
    {
        return await _context.Organizations
            .AnyAsync(x => x.Id == organizationId, cancellationToken);
    }

    public async Task<Domain.Entities.Organizations.Organization?> GetByIdAsync(int organizationId, CancellationToken cancellationToken = default)
    {
        return await _context.Organizations
            .FirstOrDefaultAsync(x => x.Id == organizationId, cancellationToken);
    }
}
