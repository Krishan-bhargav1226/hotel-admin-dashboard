using Domain.Entities.ApplicationUsers;

namespace Application.Interfaces.Services;

public interface IJWTService
{
    Task<string> GenerateToken(string userId);
}
