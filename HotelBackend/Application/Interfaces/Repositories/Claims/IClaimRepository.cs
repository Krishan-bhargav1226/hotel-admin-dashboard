using Application.Features.Claims.Command;
using Application.Features.Roles.Command;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces.Repositories.Claims;

public interface IClaimRepository
{
    Task<List<IdentityUserClaim<string>>> GetAll();
    Task<IdentityUserClaim<string>> GetById(int id);
    Task<bool> Update(int id, CreateClaimCommand command);
    Task<bool> Delete(int id);

    Task Create(CreateUpdateRoleClaimCommand command);
}
