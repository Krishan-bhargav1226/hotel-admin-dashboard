using Domain.Entities.ApplicationRoles;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Roles.Command;

public class DeleteRoleCommand : IRequest<Result<int>>
{
    public Guid Id { get; set; }

    public DeleteRoleCommand(Guid id)
    {
        Id = id;
    }
    internal class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, Result<int>>
    {
        private readonly RoleManager<Role> _roleManager;

        public DeleteRoleCommandHandler(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<Result<int>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            var roleId = await _roleManager.Roles.FirstOrDefaultAsync(x => x.Id == request.Id.ToString());
            if (roleId == null)
            {
                return Result<int>.BadRequest("Role id not found");
            }
            await _roleManager.DeleteAsync(roleId);
            return Result<int>.Success("Deleted.....");
        }
    }
}
