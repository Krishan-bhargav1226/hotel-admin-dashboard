using Application.Dto.Users.GetUserDtos;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using AutoMapper;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Users.Queries;

public class GetCurrentUserQuery : IRequest<Result<GetUserDto>>;

internal class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<GetUserDto>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userOrganization;

    public GetCurrentUserQueryHandler(UserManager<User> userManager, IMapper mapper, IUserIdAndOrganizationIdRepository userOrganization)
    {
        _userManager = userManager;
        _mapper = mapper;
        _userOrganization = userOrganization;
    }

    public async Task<Result<GetUserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var useOrga = await _userOrganization.Get();

        var user = await _userManager.Users
            .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == useOrga.UserId, cancellationToken);

        if (user == null)
            return Result<GetUserDto>.NotFound("User not found.");

        var userDto = _mapper.Map<GetUserDto>(user);

        return Result<GetUserDto>.Success(userDto, "User retrieved successfully.");
    }
}
