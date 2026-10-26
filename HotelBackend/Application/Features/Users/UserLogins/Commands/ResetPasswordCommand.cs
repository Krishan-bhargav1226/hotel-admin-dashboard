using Application.Common.Exceptions;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Http;
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
    public string Token { get; set; }

    [Required(ErrorMessage = "NewPassword is required")]
    public string NewPassword { get; set; }
}

internal class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<int>>
{
    private readonly UserManager<User> _userManager;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _organization;
    private readonly IHttpContextAccessor _contextAccessor;
    private readonly IConfiguration _configuration;

    public ResetPasswordCommandHandler(UserManager<User> userManager, ValidationManager validationManager, IUserIdAndOrganizationIdRepository organization, IHttpContextAccessor contextAccessor, IConfiguration configuration)
    {
        _userManager = userManager;
        _validationManager = validationManager;
        _organization = organization;
        _contextAccessor = contextAccessor;
        _configuration = configuration;
    }

    public async Task<Result<int>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidatePassword(request.NewPassword);

        var principal = ValidateToken(request.Token);

        _contextAccessor.HttpContext.User = principal;

        var useOrga = await _organization.Get();

        var user = await _userManager.FindByIdAsync(useOrga.UserId);

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);

        if (!resetResult.Succeeded)
        {
            return Result<int>.BadRequest("Something went wrong..");
        }

        return Result<int>.Success("Password update successfully");
    }

    private ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = _configuration["JwtSettings:Issuer"],
                ValidAudience = _configuration["JwtSettings:Audience"]
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch
        {
            throw new BadRequestException("Invalid token!");
        }
    }
}
