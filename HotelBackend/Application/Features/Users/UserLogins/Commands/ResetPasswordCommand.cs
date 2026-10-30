using Application.Features.Commons;
using Application.Interfaces.Services;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Shared;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Application.Features.Users;

public class ResetPasswordCommand : IRequest<Result<int>>
{
    [Required(ErrorMessage = "Token is required")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "NewPassword is required")]
    public string NewPassword { get; set; } = string.Empty;
}

internal class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;
    private readonly ValidationManager _validationManager;
    private readonly IConfiguration _configuration;

    public ResetPasswordCommandHandler(UserManager<User> userManager, ValidationManager validationManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _validationManager = validationManager;
        _configuration = configuration;
    }

    public async Task<Result<int>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _validationManager.ValidatePassword(request.NewPassword);
        }
        catch (Exception exception)
        {
            return Result<int>.BadRequest(exception.Message);
        }

        var principal = ValidateResetToken(request.Token);
        if (principal == null)
            return Result<int>.BadRequest("The reset token is invalid or expired.");

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var stamp = principal.FindFirst("SecurityStamp")?.Value;
        var user = string.IsNullOrEmpty(userId) ? null : await _userManager.FindByIdAsync(userId);
        if (user == null || user.IsDeleted || !string.Equals(user.SecurityStamp, stamp, StringComparison.Ordinal))
            return Result<int>.BadRequest("The reset token is invalid or expired.");

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);
        if (!resetResult.Succeeded)
            return Result<int>.BadRequest(string.Join(", ", resetResult.Errors.Select(error => error.Description)));

        return Result<int>.Success("Password updated. Sign in with the new password.");
    }

    private ClaimsPrincipal? ValidateResetToken(string token)
    {
        var secret = _configuration["JwtSettings:SecretKey"];
        if (string.IsNullOrWhiteSpace(secret))
            return null;

        var handler = new JwtSecurityTokenHandler();
        try
        {
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = _configuration["JwtSettings:Issuer"],
                ValidAudience = _configuration["JwtSettings:Audience"],
                ClockSkew = TimeSpan.FromMinutes(1)
            }, out _);

            var purpose = principal.FindFirst("purpose")?.Value;
            return purpose == "password-reset" ? principal : null;
        }
        catch
        {
            return null;
        }
    }
}
