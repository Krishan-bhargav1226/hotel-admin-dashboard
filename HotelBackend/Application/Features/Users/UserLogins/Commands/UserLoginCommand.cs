using Application.Features.Commons;
using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using Domain.Common.Enums.Otps;
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
}

public class UserLoginCommand : IRequest<Result<UserLoginResponse>>
{
    public string Code { get; set; }
    public string Password { get; set; }
}

internal class UserLoginCommandHandler : IRequestHandler<UserLoginCommand, Result<UserLoginResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly IJWTService _jWTService;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public UserLoginCommandHandler(
        UserManager<User> userManager,
        IJWTService jWTService,
        IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository,
        IOtpRepository otpRepository,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _jWTService = jWTService;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _otpRepository = otpRepository;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<Result<UserLoginResponse>> Handle(UserLoginCommand request, CancellationToken cancellationToken)
    {
        var inputCode = (request.Code ?? "").Trim();
        foreach (var alias in _configuration.GetSection("Auth:LoginAliases").GetChildren())
        {
            if (inputCode.Equals(alias.Key, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(alias.Value))
            {
                inputCode = alias.Value;
                break;
            }
        }

        User? user = null;

        if (!ValidationManager.IsValidPhoneNumber(inputCode) && inputCode.Contains("@"))
        {
            user = await _userManager.Users
               .Include(x => x.Organization)
               .FirstOrDefaultAsync(x => x.Email.ToLower() == inputCode.ToLower(), cancellationToken);
        }
        else if (ValidationManager.IsValidPhoneNumber(inputCode))
        {
            user = await _userManager.Users
               .Include(x => x.Organization)
               .FirstOrDefaultAsync(x => x.PhoneNumber.ToLower() == inputCode.ToLower(), cancellationToken);
        }
        else
        {
            user = await _userManager.Users
               .Include(x => x.Organization)
               .FirstOrDefaultAsync(x => x.UserName.ToLower() == inputCode.ToLower(), cancellationToken);
        }

        if (user == null)
        {
            return Result<UserLoginResponse>.BadRequest("Username or password is incorrect!");
        }

        bool isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return Result<UserLoginResponse>.BadRequest("Username or password is incorrect!");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var otpRoles = _configuration.GetSection("Auth:OtpRoles").Get<string[]>() ?? [];
        var requiresOtp = roles.Any(role => otpRoles.Contains(role, StringComparer.OrdinalIgnoreCase));

        if (requiresOtp)
        {
            var otpEntity = await _otpRepository.GenerateAndAddOtpAsync(user.Id, "SignIn", OtpSentOn.Email, cancellationToken);
            try
            {
                await _emailService.SendEmail(
                    user.Email ?? string.Empty,
                    "Hotel sign-in code",
                    $"Your sign-in code is {otpEntity.Otp}. It expires in 5 minutes.");
            }
            catch (Exception)
            {
                return Result<UserLoginResponse>.BadRequest("Could not send the verification code. Try again later.");
            }

            return Result<UserLoginResponse>.Success(new UserLoginResponse
            {
                RequiresOtp = true,
                Email = user.Email,
                Username = user.UserName,
                UserId = user.Id,
                Message = "A verification code has been sent to your email."
            }, "A verification code has been sent to your email.");
        }

        string token = await _jWTService.GenerateToken(user.Id);
        var primaryRole = roles.FirstOrDefault() ?? "User";

        return Result<UserLoginResponse>.Success(new UserLoginResponse
        {
            RequiresOtp = false,
            Email = user.Email,
            Username = user.UserName,
            UserId = user.Id,
            Token = token,
            Message = "LogIn successfully.",
            Role = primaryRole,
            FirstName = user.FirstName,
            LastName = user.LastName
        }, "LogIn successfully....", token);
    }
}