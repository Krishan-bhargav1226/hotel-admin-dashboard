using Application.Common.Exceptions;
using Application.Common.Mappings.Commons;
using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Otps;
using Domain.Common.Enums.Users;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Templates;
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
    public string FirstName { get; set; }

    public string? LastName { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [Length(6, 30, ErrorMessage = "Password must between 6 to 30 characters")]
    public string Password { get; set; }
}

internal class UserRegistrationCommandHandler : IRequestHandler<UserRegistrationCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public UserRegistrationCommandHandler(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        IMapper mapper,
        IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository,
        IOtpRepository otpRepository,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _otpRepository = otpRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(UserRegistrationCommand request, CancellationToken cancellationToken)
    {
        request.Email = request.Email?.Trim().ToLower();

        if (request.Email == null && request.PhoneNumber == null)
        {
            return Result<string>.BadRequest("Email address or phone number is required");
        }

        var userOrgInfo = await _userIdAndOrganizationIdRepository.Get();
        var organizationId = userOrgInfo?.OrganizationId ?? 1;

        if (request.Email != null)
        {
            var existingUser = await _userManager.Users
                .AnyAsync(x => x.Email != null && x.Email.ToLower() == request.Email, cancellationToken);
            if (existingUser)
            {
                return Result<string>.BadRequest("User with this email already exists.");
            }
        }

        if (request.PhoneNumber != null)
        {
            var existingUser = await _userManager.Users
                .AnyAsync(x => x.PhoneNumber != null && x.PhoneNumber == request.PhoneNumber, cancellationToken);
            if (existingUser)
            {
                return Result<string>.BadRequest("User with this phone number already exists.");
            }
        }

        // Create new user as a normal user
        var user = new User
        {
            UserName = request.Email ?? Guid.NewGuid().ToString(),
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName?.Trim() ?? string.Empty,
            OrganizationId = organizationId,
            EmailConfirmed = true,
            PhoneNumberConfirmed = true,
            UserType = UserType.WebUser
        };

        var createUserResult = await _userManager.CreateAsync(user, request.Password);

        if (!createUserResult.Succeeded)
        {
            var errors = string.Join(", ", createUserResult.Errors.Select(e => e.Description));
            return Result<string>.BadRequest($"Failed to create user: {errors}");
        }

        // Ensure default "User" role exists and assign it
        if (!await _roleManager.RoleExistsAsync("User"))
        {
            await _roleManager.CreateAsync(new Role { Name = "User", OrganizationId = organizationId });
        }
        await _userManager.AddToRoleAsync(user, "User");

        // Attempt optional OTP generation and email notice safely
        try
        {
            if (request.Email != null)
            {
                var otpEntity = await _otpRepository.GenerateAndAddOtpAsync(user.Id, "Registration", OtpSentOn.Email, cancellationToken);
                await SendRegistrationOtpEmail(request.Email, otpEntity.Otp, $"{request.FirstName} {request.LastName}".Trim());
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[REGISTRATION NOTICE]: Email/OTP notification skipped: {ex.Message}");
        }

        return Result<string>.Success(user.Id, "User registered successfully as a normal user.");
    }

    private async Task SendRegistrationOtpEmail(string email, int otp, string name)
    {
        int templateId = 3;

        var template = await _unitOfWork.Repository<Template>().Entities
            .Include(x => x.TemplateBody)
            .FirstOrDefaultAsync(x => x.Id == templateId);

        if (template != null && template.TemplateBody != null)
        {
            string subject = template.Subject;

            string emailBody = template.TemplateBody.Body
                .Replace("{{otp}}", otp.ToString())
                .Replace("{{username}}", name);

            await _emailService.SendEmail(email, subject, emailBody);
        }
    }
}
