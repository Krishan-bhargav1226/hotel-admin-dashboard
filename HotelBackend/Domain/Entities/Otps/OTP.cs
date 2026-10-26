using Domain.Common;
using Domain.Common.Enums.Otps;
using Domain.Entities.ApplicationUsers;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.OTPs;

public class OTP : BaseAuditableEntity
{
    public int Otp { get; set; }
    public bool IsChecked { get; set; } = false;
    public string? ForOtp { get; set; }
    public OtpSentOn OtpSentOn { get; set; }
    public int TimesChecked { get; set; } = 0;

    [ForeignKey("User")]
    public string UserId { get; set; }
    public User? User { get; set; }
}
