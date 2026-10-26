using Application.Dto.Users.UserRoles;
using AutoMapper;
using Domain.Entities.ApplicationRoles;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Roles.Queries;

public class GetAllRoleQuery : IRequest<Result<List<GetRoleDto>>>
{
}
internal class GetRoleQueryHandler : IRequestHandler<GetAllRoleQuery, Result<List<GetRoleDto>>>
{
    private readonly IMapper _mapper;
    private readonly RoleManager<Role> _roleManager;

    public GetRoleQueryHandler(IMapper mapper, RoleManager<Role> roleManager)
    {
        _mapper = mapper;
        _roleManager = roleManager;
    }

    async Task<Result<List<GetRoleDto>>> IRequestHandler<GetAllRoleQuery, Result<List<GetRoleDto>>>.Handle(GetAllRoleQuery request, CancellationToken cancellationToken)
    {
        var roleList = await _roleManager.Roles.ToListAsync();
        if (roleList == null)
        {
            return Result<List<GetRoleDto>>.NotFound("Role not found");
        }
        var mapRole = _mapper.Map<List<GetRoleDto>>(roleList);
        return Result<List<GetRoleDto>>.Success(mapRole, "Role List");
    }
}
