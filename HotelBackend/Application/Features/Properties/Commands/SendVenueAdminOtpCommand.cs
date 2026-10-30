using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using Domain.Common.Enums.Otps;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Properties.Commands;

public class SendVenueAdminOtpCommand : IRequest<Result<string>>
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

internal class SendVenueAdminOtpCommandHandler : IRequestHandler<SendVenueAdminOtpCommand, Result<string>>
{
    private readonly IUserIdAndOrganizationIdRepository _caller;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly UserManager<User> _userManager;

    public SendVenueAdminOtpCommandHandler(
        IUserIdAndOrganizationIdRepository caller,
        IOtpRepository otpRepository,
        IEmailService emailService,
        UserManager<User> userManager)
    {
        _caller = caller;
        _otpRepository = otpRepository;
        _emailService = emailService;
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(SendVenueAdminOtpCommand request, CancellationToken cancellationToken)
    {
        var current = await _caller.Get();
        if (!current.IsSuperAdmin)
            return Result<string>.BadRequest("Only a Super Admin can verify a venue admin email.");

        var email = request.Email.Trim().ToLowerInvariant();
        var taken = await _userManager.Users.AnyAsync(x => x.Email != null && x.Email.ToLower() == email, cancellationToken);
        if (taken)
            return Result<string>.BadRequest("This email already has an account.");

        try
        {
            var otp = await _otpRepository.GenerateForEmailAsync(email, "VenueAdmin", OtpSentOn.Email, cancellationToken);
            await _emailService.SendEmail(email, "Verify the venue admin email", $"Your hotel setup code is {otp.Otp}. It expires in 5 minutes.");
        }
        catch
        {
            return Result<string>.BadRequest("The verification email could not be sent. Check the mail settings and try again.");
        }

        return Result<string>.Success("A 6-digit code was sent to the venue admin email.");
    }
}
