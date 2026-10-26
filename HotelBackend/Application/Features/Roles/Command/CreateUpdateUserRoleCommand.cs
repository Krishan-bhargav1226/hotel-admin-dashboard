using Application.Interfaces.Repositories.Users.UserRoles;
using MediatR;
using Shared;

namespace Application.Features.Roles.Command;

public class CreateUpdateUserRoleCommand : IRequest<Result<string>>
{
    public CreateUpdateUserRoleCommand(string userId, List<string> roles)
    {
        UserId = userId;
        Roles = roles;
    }

    public string UserId { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
}
internal class CreateUserRoleCommandHandler : IRequestHandler<CreateUpdateUserRoleCommand, Result<string>>
{
    private readonly IUserRoleRepository _repository;

    public CreateUserRoleCommandHandler(IUserRoleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<string>> Handle(CreateUpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        await _repository.CreateUpdateUserRole(request.UserId, request.Roles);

        return Result<string>.Success("Roles assigned to user Successfully");
    }
}
