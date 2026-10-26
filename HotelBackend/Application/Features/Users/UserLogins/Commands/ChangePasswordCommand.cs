using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users;

public class ChangePasswordCommand : IRequest<Result<int>>
{
    [MinLength(6)]
    public string OldPassword { get; set; }

    [Length(6, 30)]
    public string NewPassword { get; set; }
}

internal class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganization;

    public ChangePasswordCommandHandler(UserManager<User> userManager, IUserIdAndOrganizationIdRepository userOrganization)
    {
        _userManager = userManager;
        _userOrganization = userOrganization;
    }

    public async Task<Result<int>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        if (request.OldPassword == request.NewPassword)
        {
            return Result<int>.BadRequest("Old password and new password not same..");
        }

        var useOrga = await _userOrganization.Get();

        var userId = useOrga.UserId;

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return Result<int>.BadRequest("User doesn't exists.");
        }

        var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            return Result<int>.BadRequest($"Error changing password: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return Result<int>.Success("Password changed successfully.");
    }
}
