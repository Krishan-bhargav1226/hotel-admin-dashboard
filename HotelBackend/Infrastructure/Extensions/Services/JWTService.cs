using Application.Interfaces.Services;
using Domain.Entities.ApplicationUsers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Infrastructure.Extensions.Services;

public class JWTService : IJWTService
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<User> _userManager;

    public JWTService(IConfiguration configuration, UserManager<User> userManager)
    {
        _configuration = configuration;
        _userManager = userManager;
    }

    public async Task<string> GenerateToken(string userId)
    {
        var user = await _userManager.Users
            .Include(x => x.UserRoles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user == null)
            throw new InvalidOperationException("User was not found.");

        var userRoles = await _userManager.GetRolesAsync(user);
        var primaryRole = userRoles.FirstOrDefault() ?? string.Empty;
        var displayName = $"{user.FirstName} {user.LastName}".Trim();

        var authClaims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, displayName),
            new("id", user.Id),
            new("Code", user.UserName ?? string.Empty),
            new("Role", primaryRole),
            new("RoleId", user.UserRoles.FirstOrDefault()?.RoleId ?? string.Empty),
            new("Email", user.Email ?? string.Empty),
            new("MobileNo", user.PhoneNumber ?? string.Empty),
            new("Name", displayName),
            new("OrganizationId", user.OrganizationId.ToString()),
            new("PropertyId", user.PropertyId?.ToString() ?? string.Empty),
            new("SecurityStamp", user.SecurityStamp ?? string.Empty),
            new("IsEmailConfirmed", user.EmailConfirmed.ToString())
        };

        authClaims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

        var hours = int.TryParse(_configuration["JwtSettings:AccessTokenHours"], out var configured) && configured > 0
            ? configured
            : 8;
        return WriteToken(authClaims, DateTime.UtcNow.AddHours(hours));
    }

    public string GeneratePurposeToken(User user, string purpose, TimeSpan lifetime)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new("id", user.Id),
            new("purpose", purpose),
            new("SecurityStamp", user.SecurityStamp ?? string.Empty)
        };
        return WriteToken(claims, DateTime.UtcNow.Add(lifetime));
    }

    private string WriteToken(List<Claim> claims, DateTime expires)
    {
        var secret = _configuration["JwtSettings:SecretKey"]
            ?? throw new InvalidOperationException("JwtSettings:SecretKey is not configured.");
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            expires: expires,
            claims: claims,
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
