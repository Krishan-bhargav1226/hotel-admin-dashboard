using Application.Interfaces.Repositories.Claims;
using MediatR;
using Shared;

namespace Application.Features.Roles.Command;

public class CreateUpdateRoleClaimCommand : IRequest<Result<int>>
{
    public CreateUpdateRoleClaimCommand(Guid roleId, string[] menuId)
    {
        RoleId = roleId;
        MenuId = menuId;
    }

    public Guid RoleId { get; set; }
    public string[] MenuId { get; set; } = [];
}

internal class CreateRoleClaimCommandHandler : IRequestHandler<CreateUpdateRoleClaimCommand, Result<int>>
{
    private readonly IClaimRepository _roleClaimRepository;

    public CreateRoleClaimCommandHandler(IClaimRepository roleClaimRepository)
    {
        _roleClaimRepository = roleClaimRepository;
    }

    public async Task<Result<int>> Handle(CreateUpdateRoleClaimCommand request, CancellationToken cancellationToken)
    {
        await _roleClaimRepository.Create(request);

        return Result<int>.Success("Role menu claims created successfully");
    }
}
