using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Otps;
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
    public string Username { get; set; }
}

internal class VerifyOtpCommandHandler : IRequestHandler<VerifyOtpCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<User> _userManager;
    private readonly IJWTService _jwtService;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public VerifyOtpCommandHandler(IUnitOfWork unitOfWork, UserManager<User> userManager, IJWTService jwtService, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _jwtService = jwtService;
    }

    public async Task<Result<string>> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var input = (request.Username ?? "").Trim();
        if (input.Equals("hotel1admin", StringComparison.OrdinalIgnoreCase))
        {
            input = "akf22918@gmail.com";
        }
        else if (input.Equals("hotel2admin", StringComparison.OrdinalIgnoreCase))
        {
            input = "madeforbusiness11@gmail.com";
        }
        else if (input.Equals("superadmin", StringComparison.OrdinalIgnoreCase))
        {
            input = "superadmin@hotel.local";
        }

        User? user = null;

        if (!ValidationManager.IsValidPhoneNumber(input))
        {
            user = await _userManager.Users
                .Where(x => x.Email.ToLower() == input.ToLower() || x.UserName.ToLower() == input.ToLower())
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
            {
                return Result<string>.BadRequest("Email or username not registered.");
            }
        }
        else
        {
            user = await _userManager.Users
                .Where(x => x.PhoneNumber.ToLower() == input.ToLower())
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null)
            {
                return Result<string>.BadRequest("Phone number not registered.");
            }
        }

        var otpEntity = await _unitOfWork.Repository<OTP>().Entities
            .Where(x => x.UserId == user.Id)
            .OrderByDescending(x => x.CreatedDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (otpEntity == null)
        {
            return Result<string>.BadRequest("No OTP requested or code has expired. Please request a new OTP.");
        }

        if (otpEntity.TimesChecked > 5)
        {
            return Result<string>.BadRequest("You checked OTP too many times. Please request a new OTP.");
        }

        var timeDifference = DateTime.UtcNow - otpEntity.CreatedDate;

        if (timeDifference.HasValue && timeDifference.Value.TotalMinutes >= 5)
        {
            return Result<string>.BadRequest("OTP expired. Please request a new OTP.");
        }

        if (otpEntity.Otp != request.Otp)
        {
            otpEntity.TimesChecked += 1;

            await _unitOfWork.Repository<OTP>().UpdateAsync(otpEntity, otpEntity.Id);
            await _unitOfWork.Save(cancellationToken);

            return Result<string>.BadRequest("Incorrect 4-digit OTP. Please check the code sent to your email.");
        }

        await _unitOfWork.Repository<OTP>().DeleteAsync(otpEntity);
        await _unitOfWork.Save(cancellationToken);

        if (!user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);
        }

        var token = await _jwtService.GenerateToken(user.Id);

        return Result<string>.Success(token, "OTP verified successfully", token);
    }
}