namespace Application.Interfaces.Repositories.UserIdAndOrganizationIds;

public interface ICurrentOrganizationProvider
{
    List<int> GetOrganizationIds();
    public IReadOnlyCollection<int> OrganizationIds => GetOrganizationIds();
}
