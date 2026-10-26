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
            .Include(x => x.UserRoles).ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId);

        var userRoles = await _userManager.GetRolesAsync(user);

        var authClaims = new List<Claim>
            {

                new Claim("Code", user?.UserName ?? ""),
                new Claim(ClaimTypes.NameIdentifier, user?.Id.ToString() ?? ""),
                new Claim("id", user?.Id.ToString() ?? ""),
                 new Claim("Role", userRoles.FirstOrDefault() ?? ""),
                 new Claim("RoleId", user?.UserRoles?.FirstOrDefault()?.RoleId ?? ""),
                 new Claim("Email", user?.Email ?? ""),
                 new Claim("MobileNo", user?.PhoneNumber ?? ""),
                 new Claim("Name", user?.FirstName+" "+user?.LastName ?? ""),
                 new Claim("IsEmailConfirmed", user?.EmailConfirmed.ToString() ?? ""),
            };

        authClaims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            expires: DateTime.Now.AddDays(7),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256));

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return tokenString;
    }
}
