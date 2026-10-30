using Application.Features.Commons;
using Application.Interfaces.Services;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Shared;

namespace Application.Features.Users;

public class UserLoginResponse
{
    public bool RequiresOtp { get; set; }
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? UserId { get; set; }
    public string? Token { get; set; }
    public string? Message { get; set; }
    public string? Role { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int OrganizationId { get; set; }
    public int? PropertyId { get; set; }
}

public class UserLoginCommand : IRequest<Result<UserLoginResponse>>
{
    public string Code { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

internal class UserLoginCommandHandler : IRequestHandler<UserLoginCommand, Result<UserLoginResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly IJWTService _jwtService;
    private readonly IConfiguration _configuration;

    public UserLoginCommandHandler(UserManager<User> userManager, IJWTService jwtService, IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<Result<UserLoginResponse>> Handle(UserLoginCommand request, CancellationToken cancellationToken)
    {
        var inputCode = (request.Code ?? string.Empty).Trim();
        foreach (var alias in _configuration.GetSection("Auth:LoginAliases").GetChildren())
        {
            if (inputCode.Equals(alias.Key, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(alias.Value))
            {
                inputCode = alias.Value;
                break;
            }
        }

        var normalized = inputCode.ToLower();
        User? user;

        if (inputCode.Contains('@'))
        {
            user = await _userManager.Users
                .FirstOrDefaultAsync(x => x.Email != null && x.Email.ToLower() == normalized, cancellationToken);
        }
        else if (ValidationManager.IsValidPhoneNumber(inputCode))
        {
            user = await _userManager.Users
                .FirstOrDefaultAsync(x => x.PhoneNumber == inputCode, cancellationToken);
        }
        else
        {
            user = await _userManager.Users
                .FirstOrDefaultAsync(x => x.UserName != null && x.UserName.ToLower() == normalized, cancellationToken);
        }

        if (user == null || user.IsDeleted || !user.IsActive)
            return Result<UserLoginResponse>.BadRequest("Username or password is incorrect!");

        if (await _userManager.IsLockedOutAsync(user))
            return Result<UserLoginResponse>.BadRequest("This account is locked after too many attempts. Try again in a few minutes.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            await _userManager.AccessFailedAsync(user);
            return Result<UserLoginResponse>.BadRequest("Username or password is incorrect!");
        }

        if (!user.EmailConfirmed)
            return Result<UserLoginResponse>.BadRequest("Verify your email before signing in. Check your inbox for the code.");

        await _userManager.ResetAccessFailedCountAsync(user);
        var roles = await _userManager.GetRolesAsync(user);
        var token = await _jwtService.GenerateToken(user.Id);

        return Result<UserLoginResponse>.Success(new UserLoginResponse
        {
            RequiresOtp = false,
            Email = user.Email,
            Username = user.UserName,
            UserId = user.Id,
            Token = token,
            Message = "LogIn successfully.",
            Role = roles.FirstOrDefault() ?? "User",
            FirstName = user.FirstName,
            LastName = user.LastName,
            OrganizationId = user.OrganizationId,
            PropertyId = user.PropertyId
        }, "LogIn successfully.", token);
    }
}
