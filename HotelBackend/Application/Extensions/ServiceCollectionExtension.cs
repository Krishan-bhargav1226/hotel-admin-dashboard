using Application.Features.Commons;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Application.Extensions;

public static class ServiceCollectionExtension
{
    public static void ApplicationLayer(this IServiceCollection services)
    {
        services.AddMapping();
        services.AddMediator();
        services.AddScoped<ValidationManager>();
    }
    public static void AddMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
    }
    public static void AddMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
    }

}



