using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Otps;
using Domain.Common.Enums.Users;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Notifications;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users.Commands;

public class UserRegistrationCommand : IRequest<Result<string>>, ICreateMapFrom<User>
{
    [Required(ErrorMessage = "FirstName is required")]
    [StringLength(50, ErrorMessage = "FirstName cannot exceed 50 characters")]
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [Length(8, 30, ErrorMessage = "Password must be 8 to 30 characters and include upper, lower, and a digit.")]
    public string Password { get; set; } = string.Empty;
}

internal class UserRegistrationCommandHandler : IRequestHandler<UserRegistrationCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ValidationManager _validationManager;

    public UserRegistrationCommandHandler(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        IOtpRepository otpRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork,
        ValidationManager validationManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _otpRepository = otpRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
        _validationManager = validationManager;
    }

    public async Task<Result<string>> Handle(UserRegistrationCommand request, CancellationToken cancellationToken)
    {
        request.Email = request.Email?.Trim().ToLower();
        request.PhoneNumber = request.PhoneNumber?.Trim();

        if (string.IsNullOrWhiteSpace(request.Email))
            return Result<string>.BadRequest("Email address is required.");

        try
        {
            _validationManager.ValidatePassword(request.Password);
        }
        catch (Exception exception)
        {
            return Result<string>.BadRequest(exception.Message);
        }

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber) && !ValidationManager.IsValidPhoneNumber(request.PhoneNumber))
            return Result<string>.BadRequest("Phone number must be 10 digits.");

        var organization = await _userManager.Users
            .Select(x => (int?)x.OrganizationId)
            .FirstOrDefaultAsync(cancellationToken);
        var organizationId = organization ?? 1;

        var emailTaken = await _userManager.Users
            .AnyAsync(x => x.Email != null && x.Email.ToLower() == request.Email, cancellationToken);
        if (emailTaken)
            return Result<string>.BadRequest("User with this email already exists.");

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            var phoneTaken = await _userManager.Users
                .AnyAsync(x => x.PhoneNumber == request.PhoneNumber, cancellationToken);
            if (phoneTaken)
                return Result<string>.BadRequest("User with this phone number already exists.");
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName?.Trim() ?? string.Empty,
            OrganizationId = organizationId,
            EmailConfirmed = false,
            PhoneNumberConfirmed = false,
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            UserType = UserType.WebUser
        };

        var createUserResult = await _userManager.CreateAsync(user, request.Password);
        if (!createUserResult.Succeeded)
        {
            var errors = string.Join(", ", createUserResult.Errors.Select(e => e.Description));
            return Result<string>.BadRequest($"Failed to create user: {errors}");
        }

        if (!await _roleManager.RoleExistsAsync("User"))
            await _roleManager.CreateAsync(new Role { Name = "User", OrganizationId = organizationId });

        var roleResult = await _userManager.AddToRoleAsync(user, "User");
        if (!roleResult.Succeeded)
            return Result<string>.BadRequest("The account was created but the default role could not be saved.");

        var emailSent = await SendVerificationCode(user, cancellationToken);
        await NotifySuperAdmins(user, cancellationToken);

        var message = emailSent
            ? "Account saved. Enter the 6-digit code sent to your email. A Super Admin will assign your hotel and role after verification."
            : "Account saved, but the verification email could not be sent. Use resend verification and ask a Super Admin to assign your hotel.";
        return Result<string>.Success(user.Id, message);
    }

    private async Task<bool> SendVerificationCode(User user, CancellationToken cancellationToken)
    {
        try
        {
            var otp = await _otpRepository.GenerateAndAddOtpAsync(user.Id, "Register", OtpSentOn.Email, cancellationToken);
            var name = $"{user.FirstName} {user.LastName}".Trim();
            await _emailService.SendEmail(
                user.Email!,
                "Verify your hotel account",
                $"Hello {name}, your verification code is {otp.Otp}. It expires in 5 minutes.");
            return true;
        }
        catch
        {
            return false;
        }
    }

    private async Task NotifySuperAdmins(User user, CancellationToken cancellationToken)
    {
        var name = $"{user.FirstName} {user.LastName}".Trim();
        await _unitOfWork.Repository<AdminNotification>().AddAsync(new AdminNotification
        {
            Title = "New user waiting for access",
            Message = $"{name} ({user.Email}) registered. Verify status is pending until they confirm email. Assign a hotel and a role.",
            SubjectUserId = user.Id,
            IsRead = false
        });
        await _unitOfWork.Save(cancellationToken);
    }
}
