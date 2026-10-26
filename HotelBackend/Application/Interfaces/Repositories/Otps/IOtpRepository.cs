using Domain.Common.Enums.Otps;
using Domain.Entities.OTPs;

namespace Application.Interfaces.Repositories.Otps;

public interface IOtpRepository
{
    Task<OTP> GenerateAndAddOtpAsync(string userId, string forOtp, OtpSentOn otpSentOn, CancellationToken cancellationToken);
}
