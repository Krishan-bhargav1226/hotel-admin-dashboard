using Application.Interfaces.Repositories.Payments;
using Application.Interfaces.Services;
using Infrastructure.Extensions.Services;
using MediatR;
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
        services
            .AddTransient<IMediator, Mediator>()
        .AddTransient<IEmailService, EmailService>()
        .AddTransient<IJWTService, JWTService>()
        .AddTransient<IPaymentService, PaymentService>();
    }
}
