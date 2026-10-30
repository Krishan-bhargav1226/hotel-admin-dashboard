using Application.Features.Commons;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.OTPs;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users;

public class VerifyOtpCommand : IRequest<Result<string>>
{
    [Required(ErrorMessage = "Otp is required")]
    public int Otp { get; set; }

    [Required(ErrorMessage = "Username is required")]
    public string Username { get; set; } = string.Empty;
}

internal class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<User> _userManager;
    private readonly IJWTService _jwtService;

    public VerifyOtpCommandHandler(IUnitOfWork unitOfWork, UserManager<User> userManager, IJWTService jwtService)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _jwtService = jwtService;
    }

    public async Task<Result<string>> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var input = (request.Username ?? string.Empty).Trim();
        var normalized = input.ToLowerInvariant();
        var user = await _userManager.Users
            .Where(x => (x.Email != null && x.Email.ToLower() == normalized) || (x.UserName != null && x.UserName.ToLower() == normalized) || x.PhoneNumber == input)
            .OrderByDescending(x => x.CreatedDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return Result<string>.BadRequest("The verification code is incorrect.");

        var otpEntity = await _unitOfWork.Repository<OTP>().Entities
            .Where(x => x.UserId == user.Id && x.ForOtp != "VenueAdmin")
            .OrderByDescending(x => x.CreatedDate)
            .FirstOrDefaultAsync(cancellationToken);

        var reason = OtpConfirmation.RejectReason(otpEntity, request.Otp);
        if (reason != null)
        {
            if (otpEntity != null)
            {
                await _unitOfWork.Repository<OTP>().UpdateAsync(otpEntity, otpEntity.Id);
                await _unitOfWork.Save(cancellationToken);
            }
            return Result<string>.BadRequest(reason);
        }

        var purpose = otpEntity!.ForOtp;
        await _unitOfWork.Repository<OTP>().DeleteAsync(otpEntity);
        await _unitOfWork.Save(cancellationToken);

        if (string.Equals(purpose, "Forgot", StringComparison.OrdinalIgnoreCase))
        {
            var resetToken = _jwtService.GeneratePurposeToken(user, "password-reset", TimeSpan.FromMinutes(15));
            return Result<string>.Success(resetToken, "Code verified. Use this reset token within 15 minutes.", resetToken);
        }

        if (!user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            user.UpdatedDate = DateTime.UtcNow;
            var updated = await _userManager.UpdateAsync(user);
            if (!updated.Succeeded)
                return Result<string>.BadRequest("The code was correct, but the account could not be marked verified.");
        }

        return Result<string>.Success(user.Id, "Email verified. Sign in after a Super Admin assigns your hotel and role.");
    }
}
