namespace Application.Interfaces.Services;

public interface IHotelGroundingService
{
    Task<string> GetSecureGroundingContextAsync(
        string userRole,
        int? organizationId,
        string userMessage,
        int? propertyId = null,
        string? propertyName = null,
        string? pageContext = null,
        CancellationToken cancellationToken = default);
}
