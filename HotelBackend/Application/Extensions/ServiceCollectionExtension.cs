using Application.Common.Behaviors;
using Application.Features.Commons;
using Application.Interfaces.Services;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Application.Extensions;

public static class ServiceCollectionExtension
{
    public static void ApplicationLayer(this IServiceCollection services)
    {
        services.AddMapping();
        services.AddMediator();
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LiveUpdateBehavior<,>));
        services.AddSingleton<ILiveUpdateBroadcaster, NoOpLiveUpdateBroadcaster>();
        services.AddScoped<ValidationManager>();
    }
    public static void AddMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => { }, Assembly.GetExecutingAssembly());
    }
    public static void AddMediator(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
    }

}



