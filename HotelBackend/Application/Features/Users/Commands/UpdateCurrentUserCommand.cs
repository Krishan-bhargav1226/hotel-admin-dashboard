using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users.Commands;

public class UpdateCurrentUserCommand : IRequest<Result<string>>
{
    [StringLength(50, ErrorMessage = "FirstName cannot exceed 50 characters")]
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
}

internal class UpdateCurrentUserCommandHandler : IRequestHandler<UpdateCurrentUserCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganization;

    public UpdateCurrentUserCommandHandler(UserManager<User> userManager, IUserIdAndOrganizationIdRepository userOrganization)
    {
        _userManager = userManager;
        _userOrganization = userOrganization;
    }

    public async Task<Result<string>> Handle(UpdateCurrentUserCommand request, CancellationToken cancellationToken)
    {
        var caller = await _userOrganization.Get();
        if (string.IsNullOrWhiteSpace(caller.UserId))
            return Result<string>.BadRequest("User is not signed in.");

        var user = await _userManager.FindByIdAsync(caller.UserId);
        if (user == null)
            return Result<string>.NotFound("User not found.");

        if (request.FirstName != null)
            user.FirstName = request.FirstName.Trim();
        if (request.LastName != null)
            user.LastName = request.LastName.Trim();
        if (request.PhoneNumber != null)
            user.PhoneNumber = request.PhoneNumber.Trim();

        user.UpdatedDate = DateTime.UtcNow;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            return Result<string>.BadRequest(errors);
        }

        return Result<string>.Success(user.Id, "User updated successfully.");
    }
}
