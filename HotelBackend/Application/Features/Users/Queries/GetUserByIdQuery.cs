using Application.Dto.Users.GetUserDtos;
using AutoMapper;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users.Queries;

public class GetUserByIdQuery : IRequest<Result<GetUserDto>>
{
    [Required(ErrorMessage = "Id is required")]
    public string Id { get; set; }

    public GetUserByIdQuery() { }

    public GetUserByIdQuery(string id)
    {
        Id = id;
    }
}

internal class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Result<GetUserDto>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public GetUserByIdQueryHandler(UserManager<User> userManager, IMapper mapper)
    {
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<Result<GetUserDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
            .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (user == null)
        {
            return Result<GetUserDto>.NotFound("User not found.");
        }

        var userDto = _mapper.Map<GetUserDto>(user);

        return Result<GetUserDto>.Success(userDto, "User retrieved successfully.");
    }
}
