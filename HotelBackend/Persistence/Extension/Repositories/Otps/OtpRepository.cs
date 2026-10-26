using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Otps;
using Domain.Entities.OTPs;

namespace Persistence.Extension.Repositories.Otps;

public class OtpRepository : IOtpRepository
{
    private readonly IUnitOfWork _unitOfWork;

    public OtpRepository(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OTP> GenerateAndAddOtpAsync(string userId, string forOtp, OtpSentOn otpSentOn, CancellationToken cancellationToken)
    {
        var otp = GenerateOtp();

        var otpEntity = new OTP
        {
            Otp = otp,
            UserId = userId,
            ForOtp = forOtp,
            OtpSentOn = otpSentOn,
            IsChecked = false,
            TimesChecked = 0
        };

        await _unitOfWork.Repository<OTP>().AddAsync(otpEntity);
        await _unitOfWork.Save(cancellationToken);

        return otpEntity;
    }

    private int GenerateOtp()
    {
        var otp = new Random().Next(1000, 9999);
        return otp;
    }
}
