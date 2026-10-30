using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Otps;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.OTPs;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Users;

public class ResendVerificationCommand : IRequest<Result<string>>
{
    public string? UserName { get; set; }
}

internal class ResendVerificationCommandHandler : IRequestHandler<ResendVerificationCommand, Result<string>>
{
    private const string Generic = "If an unverified account exists for that email, a new code has been sent.";
    private readonly UserManager<User> _userManager;
    private readonly IOtpRepository _otpRepository;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public ResendVerificationCommandHandler(UserManager<User> userManager, IOtpRepository otpRepository, IEmailService emailService, IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _otpRepository = otpRepository;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
    {
        var email = (request.UserName ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email))
            return Result<string>.Success(Generic);

        var user = await _userManager.Users.FirstOrDefaultAsync(
            x => x.Email != null && x.Email.ToLower() == email && !x.IsDeleted && !x.EmailConfirmed,
            cancellationToken);
        if (user == null)
            return Result<string>.Success(Generic);

        var sentToday = await _unitOfWork.Repository<OTP>().Entities
            .CountAsync(x => x.UserId == user.Id && x.CreatedDate.HasValue && x.CreatedDate.Value.Date == DateTime.UtcNow.Date, cancellationToken);
        if (sentToday > 10)
            return Result<string>.Success(Generic);

        try
        {
            var otp = await _otpRepository.GenerateAndAddOtpAsync(user.Id, "Register", OtpSentOn.Email, cancellationToken);
            await _emailService.SendEmail(user.Email!, "Verify your hotel account", $"Your verification code is {otp.Otp}. It expires in 5 minutes.");
        }
        catch
        {
            return Result<string>.Success(Generic);
        }

        return Result<string>.Success(Generic);
    }
}
