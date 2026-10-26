using Application.Dto.Users.UserRoles;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using AutoMapper;
using Domain.Entities.ApplicationRoles;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Roles.Command
{
    public class UpdateRoleCommand : IRequest<Result<GetRoleDto>>
    {
        public Guid Id { get; set; }
        public CreateRoleCommand roleCommand { get; set; }

        public UpdateRoleCommand(Guid id, CreateRoleCommand roleCommand)
        {
            Id = id;
            this.roleCommand = roleCommand;
        }
    }
    internal class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, Result<GetRoleDto>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IMapper _mapper;
        private readonly IUserIdAndOrganizationIdRepository _OrganizationIdRepository;
        public UpdateRoleCommandHandler(RoleManager<Role> roleManager, IMapper mapper, IUserIdAndOrganizationIdRepository OrganizationIdRepository)
        {
            _roleManager = roleManager;
            _mapper = mapper;
            _OrganizationIdRepository = OrganizationIdRepository;
        }

        public async Task<Result<GetRoleDto>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
        {
            var orgId = await _OrganizationIdRepository.Get();
            var roleId = await _roleManager.Roles.FirstOrDefaultAsync(x => x.Id == request.Id.ToString() && x.OrganizationId == orgId.OrganizationId);
            if (roleId == null)
            {
                return Result<GetRoleDto>.BadRequest("Sorry role id not found");
            }
            var mapRole = _mapper.Map(request.roleCommand, roleId);
            await _roleManager.UpdateAsync(mapRole);
            return Result<GetRoleDto>.Success("Update Role...");
        }
    }
}
