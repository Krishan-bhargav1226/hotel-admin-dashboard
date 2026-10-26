namespace Application.Interfaces.Repositories.Organization;

public interface IOrganizationRepository
{
    Task<bool> ExistsAsync(int organizationId, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Organizations.Organization?> GetByIdAsync(int organizationId, CancellationToken cancellationToken = default);
}
