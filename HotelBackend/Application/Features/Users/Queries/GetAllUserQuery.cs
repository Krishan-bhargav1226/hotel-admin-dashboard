using Application.Dto.Users.GetUserDtos;
using AutoMapper;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Users.Queries.GetAllUsers;

public class GetAllUserQuery : IRequest<PaginatedResult<GetUserDto>>
{
    public string? Email { get; set; }
    public string? MobileNumber { get; set; }
    public string? Name { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

internal class GetAllUserQueryHandler : IRequestHandler<GetAllUserQuery, PaginatedResult<GetUserDto>>
{
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;

    public GetAllUserQueryHandler(IMapper mapper, UserManager<User> userManager)
    {
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<PaginatedResult<GetUserDto>> Handle(GetAllUserQuery request, CancellationToken cancellationToken)
    {
        var name = request.Name?.Trim().ToLower();
        var email = request.Email?.Trim().ToLower();
        var mobile = request.MobileNumber?.Trim();

        var queryable = _userManager.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .Where(u =>
                (string.IsNullOrEmpty(name) || (u.FirstName != null && u.FirstName.ToLower().Contains(name)) || (u.LastName != null && u.LastName.ToLower().Contains(name)))
                && (string.IsNullOrEmpty(mobile) || (u.PhoneNumber != null && u.PhoneNumber.Contains(mobile)))
                && (string.IsNullOrEmpty(email) || (u.Email != null && u.Email.ToLower().Contains(email))));

        var count = await queryable.CountAsync(cancellationToken);
        List<User> users;
        int page;
        int size;

        if (request.PageNumber == 0 && request.PageSize == 0)
        {
            users = await queryable.OrderByDescending(x => x.CreatedDate).ToListAsync(cancellationToken);
            page = 1;
            size = count == 0 ? 1 : count;
        }
        else
        {
            page = request.PageNumber <= 0 ? 1 : request.PageNumber;
            size = request.PageSize <= 0 ? 10 : request.PageSize;
            users = await queryable
                .OrderByDescending(x => x.CreatedDate)
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync(cancellationToken);
        }

        return PaginatedResult<GetUserDto>.Create(_mapper.Map<List<GetUserDto>>(users), count, page, size, 200);
    }
}
