namespace Application.Interfaces.Services;

public interface IHotelGroundingService
{
    Task<string> GetSecureGroundingContextAsync(string userRole, int? organizationId, string userMessage, CancellationToken cancellationToken = default);
}
