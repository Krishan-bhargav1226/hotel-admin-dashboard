using Application.Common.Exceptions;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users;

public class ChangePasswordByAdminCommand : IRequest<Result<int>>
{
    public string UserId { get; set; }

    [MinLength(6)]
    public string NewPassword { get; set; }
}
internal class ChangePasswordByAdminCommandHandler : IRequestHandler<ChangePasswordByAdminCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;
    private readonly IHttpContextAccessor _contextAccessor;
    private readonly IUserIdAndOrganizationIdRepository _userOrganization;

    public ChangePasswordByAdminCommandHandler(UserManager<User> userManager, IHttpContextAccessor contextAccessor, IUserIdAndOrganizationIdRepository userOrganization)
    {
        _userManager = userManager;
        _contextAccessor = contextAccessor;
        _userOrganization = userOrganization;
    }

    public async Task<Result<int>> Handle(ChangePasswordByAdminCommand request, CancellationToken cancellationToken)
    {
        var useOrga = await _userOrganization.Get();

        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user == null)
        {
            throw new BadRequestException("User doesn't exists");
        }

        if (!useOrga.IsAdmin)
        {
            bool isAuthorizedSchoolUser = useOrga.IsSchool && user.OrganizationId == useOrga.UserOrganizationId;

            if (!isAuthorizedSchoolUser)
            {
                throw new BadRequestException("You are not authorized to access this resource.");
            }
        }

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);

        if (!resetResult.Succeeded)
        {
            throw new BadRequestException("Something went wrong while updating password");
        }

        return Result<int>.Success("Password changed successfully!");
    }
}
