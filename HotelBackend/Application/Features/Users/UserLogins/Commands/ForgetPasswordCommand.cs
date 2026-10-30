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

public class ForgetPasswordCommand : IRequest<Result<int>>
{
    public string? UserName { get; set; }
}

internal class ForgetPasswordCommandHandler : IRequestHandler<ForgetPasswordCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly IOtpRepository _otpRepository;

    public ForgetPasswordCommandHandler(
        UserManager<User> userManager,
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        IOtpRepository otpRepository)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _otpRepository = otpRepository;
    }

    public async Task<Result<int>> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
    {
        const string generic = "If an account with that email exists, a reset code has been sent.";
        var input = (request.UserName ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(input))
            return Result<int>.Success(generic);

        var normalized = input.ToLowerInvariant();
        var user = await _userManager.Users.FirstOrDefaultAsync(
            x => !x.IsDeleted && ((x.Email != null && x.Email.ToLower() == normalized) || x.PhoneNumber == input),
            cancellationToken);

        if (user == null || string.IsNullOrWhiteSpace(user.Email) || await TooManyRequests(user.Id))
            return Result<int>.Success(generic);

        try
        {
            var otp = await _otpRepository.GenerateAndAddOtpAsync(user.Id, "Forgot", OtpSentOn.Email, cancellationToken);
            var name = $"{user.FirstName} {user.LastName}".Trim();
            await _emailService.SendEmail(
                user.Email,
                "Hotel password reset code",
                $"Hello {name}, your reset code is {otp.Otp}. It expires in 5 minutes.");
        }
        catch
        {
            return Result<int>.Success(generic);
        }

        return Result<int>.Success(generic);
    }

    private async Task<bool> TooManyRequests(string userId)
    {
        var totalOtpToday = await _unitOfWork.Repository<OTP>().Entities
            .Where(x => x.UserId == userId && x.CreatedDate.HasValue && x.CreatedDate.Value.Date == DateTime.UtcNow.Date)
            .CountAsync();
        return totalOtpToday > 10;
    }
}
