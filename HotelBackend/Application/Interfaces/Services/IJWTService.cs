using Domain.Entities.ApplicationUsers;

namespace Application.Interfaces.Services;

public interface IJWTService
{
    Task<string> GenerateToken(string userId);
    string GeneratePurposeToken(User user, string purpose, TimeSpan lifetime);
}
