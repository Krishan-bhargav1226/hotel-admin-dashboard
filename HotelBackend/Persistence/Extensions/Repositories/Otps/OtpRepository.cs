using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Otps;
using Domain.Entities.OTPs;
using System.Security.Cryptography;

namespace Persistence.Extensions.Repositories.Otps;

public class OtpRepository : IOtpRepository
{
    private readonly IUnitOfWork _unitOfWork;

    public OtpRepository(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public Task<OTP> GenerateAndAddOtpAsync(string userId, string forOtp, OtpSentOn otpSentOn, CancellationToken cancellationToken)
    {
        return StoreAsync(userId, null, forOtp, otpSentOn, cancellationToken);
    }

    public Task<OTP> GenerateForEmailAsync(string email, string forOtp, OtpSentOn otpSentOn, CancellationToken cancellationToken)
    {
        return StoreAsync(null, email.Trim().ToLowerInvariant(), forOtp, otpSentOn, cancellationToken);
    }

    private async Task<OTP> StoreAsync(string? userId, string? email, string forOtp, OtpSentOn otpSentOn, CancellationToken cancellationToken)
    {
        var otpEntity = new OTP
        {
            Otp = RandomNumberGenerator.GetInt32(100000, 1000000),
            UserId = userId,
            Email = email,
            ForOtp = forOtp,
            OtpSentOn = otpSentOn,
            IsChecked = false,
            TimesChecked = 0,
            CreatedDate = DateTime.UtcNow
        };

        await _unitOfWork.Repository<OTP>().AddAsync(otpEntity);
        await _unitOfWork.Save(cancellationToken);
        return otpEntity;
    }
}
