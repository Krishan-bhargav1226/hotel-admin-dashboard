using Domain.Entities.OTPs;

namespace Application.Features.Commons;

public static class OtpConfirmation
{
    public const int LifetimeMinutes = 5;
    public const int MaxChecks = 5;

    public static string? RejectReason(OTP? otp, int code)
    {
        if (otp == null)
            return "No OTP requested or the code has expired. Request a new code.";

        if (otp.TimesChecked >= MaxChecks)
            return "This code was checked too many times. Request a new code.";

        if (otp.CreatedDate == null || DateTime.UtcNow - otp.CreatedDate.Value >= TimeSpan.FromMinutes(LifetimeMinutes))
            return "This code has expired. Request a new code.";

        if (otp.Otp != code)
        {
            otp.TimesChecked += 1;
            return "The verification code is incorrect.";
        }

        return null;
    }
}
