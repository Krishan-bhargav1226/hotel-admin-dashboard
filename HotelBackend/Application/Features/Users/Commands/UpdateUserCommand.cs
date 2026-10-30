using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users.Commands;

public class UpdateUserCommand : IRequest<Result<string>>
{
    [Required(ErrorMessage = "Id is required")]
    public string Id { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "FirstName cannot exceed 50 characters")]
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public bool? IsActive { get; set; }
}

internal class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;

    public UpdateUserCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id);
        if (user == null)
            return Result<string>.NotFound("User not found.");

        if (request.FirstName != null)
            user.FirstName = request.FirstName.Trim();
        if (request.LastName != null)
            user.LastName = request.LastName.Trim();
        if (request.PhoneNumber != null)
            user.PhoneNumber = request.PhoneNumber.Trim();
        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

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
