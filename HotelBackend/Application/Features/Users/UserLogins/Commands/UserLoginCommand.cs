using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Users;

public class UserLoginCommand : IRequest<Result<string>>
{
    public string Code { get; set; }
    public string Password { get; set; }
}

internal class UserLoginCommandHandler : IRequestHandler<UserLoginCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IJWTService _jWTService;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public UserLoginCommandHandler(UserManager<User> userManager, IJWTService jWTService, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _userManager = userManager;
        _jWTService = jWTService;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    async Task<Result<string>> IRequestHandler<UserLoginCommand, Result<string>>.Handle(UserLoginCommand request, CancellationToken cancellationToken)
    {
        var useOrga = await _userIdAndOrganizationIdRepository.Get();

        User? user = null;

        if (!ValidationManager.IsValidPhoneNumber(request.Code) && request.Code.Contains("@"))
        {
            user = await _userManager.Users
               .Include(x => x.Organization)
               .FirstOrDefaultAsync(x => x.Email.ToLower() == request.Code.ToLower()&&x.EmailConfirmed);
        }
        else if (ValidationManager.IsValidPhoneNumber(request.Code))
        {
            user = await _userManager.Users.Include(x => x.Organization)
               .Where(x => x.PhoneNumber.ToLower() == request.Code.ToLower() &&x.PhoneNumberConfirmed)
               .FirstOrDefaultAsync();
        }

        if (user == null)
        {
            return Result<string>.BadRequest($"Username or password is incorrect!");
        }

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Result<string>.BadRequest("Username or password is incorrect!");
        }

        string token = await _jWTService.GenerateToken(user.Id);

        return Result<string>.Success(user.Id, "LogIn successfully....", token);
    }
}