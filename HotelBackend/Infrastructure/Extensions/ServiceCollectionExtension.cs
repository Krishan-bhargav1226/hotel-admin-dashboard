using Application.Interfaces.Services;
using Infrastructure.Extensions.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Extensions;

public static class ServiceCollectionExtension
{
    public static void AddInfrastructure(this IServiceCollection services)
    {
        services.AddService();
    }

    public static void AddService(this IServiceCollection services)
    {
        services.AddHttpClient();
        services
            .AddTransient<IEmailService, EmailService>()
            .AddTransient<IJWTService, JWTService>()
            .AddTransient<IHotelGroundingService, HotelGroundingService>()
            .AddTransient<IGeminiChatService, GeminiChatService>();
    }
}
