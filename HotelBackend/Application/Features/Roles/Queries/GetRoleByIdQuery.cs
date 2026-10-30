using Application.Dto.Users.UserRoles;
using AutoMapper;
using Domain.Entities.ApplicationRoles;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Roles.Queries;

public class GetRoleByIdQuery : IRequest<Result<GetRoleDto>>
{
    public Guid Id { get; set; }

    public GetRoleByIdQuery(Guid id)
    {
        Id = id;
    }
}
internal class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, Result<GetRoleDto>>
{
    private readonly RoleManager<Role> _roleManager;
    private readonly IMapper _mapper;

    public GetRoleByIdQueryHandler(RoleManager<Role> roleManager, IMapper mapper)
    {
        _roleManager = roleManager;
        _mapper = mapper;
    }

    public async Task<Result<GetRoleDto>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        var role = await _roleManager.Roles
            .FirstOrDefaultAsync(x => x.Id == request.Id.ToString());

        if (role == null)
        {
            return Result<GetRoleDto>.NotFound("Role id not found");
        }

        var mapRole = _mapper.Map<GetRoleDto>(role);

        return Result<GetRoleDto>.Success(mapRole, "Role List");
    }
}
