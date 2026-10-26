using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Users.Commands;

public class DeleteUserCommand : IRequest<Result<string>>
{
    [Required(ErrorMessage = "Id is required")]
    public string Id { get; set; }

    public DeleteUserCommand() { }

    public DeleteUserCommand(string id)
    {
        Id = id;
    }
}

internal class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;

    public DeleteUserCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id);
        if (user == null)
        {
            return Result<string>.NotFound("User not found.");
        }

        var deleteResult = await _userManager.DeleteAsync(user);
        if (!deleteResult.Succeeded)
        {
            var errors = string.Join(", ", deleteResult.Errors.Select(e => e.Description));
            return Result<string>.BadRequest($"Failed to delete user: {errors}");
        }

        return Result<string>.Success(request.Id, "User deleted successfully.");
    }
}
