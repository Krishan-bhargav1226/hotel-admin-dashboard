using Application.Dto.GetUserIdAndOrganizationIds;

namespace Application.Interfaces.Repositories.UserIdAndOrganizationIds;

public interface IUserIdAndOrganizationIdRepository
{
    Task<GetUserIdAndOrganizationIdDto> Get();
}
