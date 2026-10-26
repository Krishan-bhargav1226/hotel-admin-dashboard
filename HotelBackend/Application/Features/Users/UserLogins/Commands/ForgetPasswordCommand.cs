using Application.Common.Exceptions;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Services;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Otps;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.OTPs;
using Domain.Entities.SystemLogs;
using Domain.Entities.Templates;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Users;

public class ForgetPasswordCommand : IRequest<Result<int>>
{
    public string? UserName { get; set; }
    public bool IsRegisterOtp { get; set; } = false;
    public bool IsLoginOtp { get; set; } = false;
}

internal class ForgetPasswordCommandHandler : IRequestHandler<ForgetPasswordCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly IUserIdAndOrganizationIdRepository _userOrganization;
    private readonly IOtpRepository _otpRepository;
    public ForgetPasswordCommandHandler(UserManager<User> userManager, IUnitOfWork unitOfWork, IEmailService emailService, IUserIdAndOrganizationIdRepository userOrganization, IOtpRepository otpRepository)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _userOrganization = userOrganization;
        _otpRepository = otpRepository;
    }

    public async Task<Result<int>> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
    {
        var useOrga = await _userOrganization.Get();

        User? user = null;

        if (!ValidationManager.IsValidPhoneNumber(request.UserName))
        {
            user = await _userManager.Users.Where(x => x.Email.ToLower() == request.UserName.ToLower() && x.EmailConfirmed).FirstOrDefaultAsync();

            if (user == null)
            {
                return Result<int>.BadRequest("Email not registered.");
            }
        }
        else
        {
            user = await _userManager.Users
            .Where(x => x.PhoneNumber.ToLower() == request.UserName.ToLower() && x.PhoneNumberConfirmed)
            .FirstOrDefaultAsync();

            if (user == null)
            {
                return Result<int>.BadRequest("Phone number not registered.");
            }
        }


        await ValidateCanRequestOtp(user.Id);

        if (!ValidationManager.IsValidPhoneNumber(request.UserName))
        {
            var otp = await _otpRepository.GenerateAndAddOtpAsync(user.Id, "Forgot", OtpSentOn.Email, cancellationToken);

            string name = user?.FirstName + " " + user?.LastName;

            await SendEmail(user!.Email!, otp.Otp, name, request.IsRegisterOtp, request.IsLoginOtp);
        }

        return Result<int>.Success("Otp has been sent to your phone number and email");
    }

    private async Task ValidateCanRequestOtp(string userId)
    {
        var totalOtpToday = await _unitOfWork.Repository<OTP>().Entities.Where(x => x.UserId == userId && x.CreatedDate.Value.Date == DateTime.UtcNow.Date).CountAsync();

        if (totalOtpToday > 10)
        {
            throw new BadRequestException("You request otp too many times try again tomorrow!");
        }
    }

    private async Task SendEmail(string email, int otp, string name, bool isRegisterOtp, bool isLoginOtp)
    {
        int templateId = isRegisterOtp ? 8 : 4;

        templateId = isLoginOtp ? 10 : templateId;

        var template = await _unitOfWork.Repository<Template>().Entities
                                      .Include(x => x.TemplateBody)
                                      .FirstOrDefaultAsync(x => x.Id == templateId);

        if (template == null)
        {
            throw new BadRequestException($"template id {templateId} doesn't exists");
        }

        string subject = template.Subject;

        string emailBody = template.TemplateBody.Body
                                                .Replace("{{otp}}", otp.ToString())
                                                .Replace("{{username}}", name);

        await _emailService.SendEmail(email, subject, emailBody);
    }
}
