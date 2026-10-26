using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Claims.Command;

public class CreateClaimCommand : IRequest<Result<int>>
{
    [Required(ErrorMessage = "UserId is required")]
    public Guid UserId { get; set; }

    [Required(ErrorMessage = "ClaimType is required")]
    [StringLength(100, ErrorMessage = "ClaimType cannot exceed 100 characters")]
    public string ClaimType { get; set; }

    [Required(ErrorMessage = "ClaimValue is required")]
    [StringLength(100, ErrorMessage = "ClaimValue cannot exceed 100 characters")]
    public string ClaimValue { get; set; }
}
internal class CreateClaimCommandHandler : IRequestHandler<CreateClaimCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;

    public CreateClaimCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<int>> Handle(CreateClaimCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            return Result<int>.NotFound("User not found.");
        }

        var claim = new System.Security.Claims.Claim(request.ClaimType, request.ClaimValue);
        var result = await _userManager.AddClaimAsync(user, claim);
        
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result<int>.BadRequest($"Failed to create claim: {errors}");
        }

        return Result<int>.Success(1, "User claim created successfully.");
    }
}
