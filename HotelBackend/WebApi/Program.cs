using Application.Extensions;
using Application.Interfaces.Services;
using Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using NLog.Web;
using Persistence.Common.Middleware;
using Persistence.DataContext;
using Persistence.Extension;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using WebApi.Bootstrap;
using WebApi.CustomMiddleware.NLog;
using WebApi.Infrastructure;

namespace WebApi;

public class Program
{
    public static void Main(string[] args)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers()
             .AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

        builder.Services.AddSignalR();

        builder.Services.AddLogging(loggingBuilder =>
        {
            loggingBuilder.ClearProviders();
            loggingBuilder.AddNLogWeb();

        });

        Environment.SetEnvironmentVariable("DB_CONNECTION_STRING", builder.Configuration.GetConnectionString("DefaultConnection"));

        builder.Services.AddPersistenceLayer(builder.Configuration, builder.Environment);

        builder.Services.ApplicationLayer();
        builder.Services.AddInfrastructure();
        builder.Services.AddSingleton<ILiveUpdateBroadcaster, SignalRLiveUpdateBroadcaster>();

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddOpenApi();
        builder.Services.AddProblemDetails();
        builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
        builder.Services.AddResponseCompression();
        builder.Services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.KnownIPNetworks.Clear();
            options.KnownProxies.Clear();
        });
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>("database", tags: ["ready"]);
        builder.Services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });

        builder.Services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 300,
                        Window = TimeSpan.FromMinutes(1)
                    }));
            options.AddPolicy("auth", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));

            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsync("Too many requests. Try again later.", token);
            };
        });

        var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
        if (corsOrigins.Length == 0 && builder.Environment.IsDevelopment())
        {
            corsOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"];
        }

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowOrigin", policy =>
            {
                policy.WithOrigins(corsOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        // Configure Swagger
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Web API", Version = "v1" });

            // Optional: Custom operation IDs
            c.CustomOperationIds(apiDesc =>
            {
                if (!apiDesc.TryGetMethodInfo(out MethodInfo methodInfo))
                    return null;
                var controller = apiDesc.ActionDescriptor.RouteValues.TryGetValue("controller", out var name)
                    ? name
                    : "Api";
                return $"{controller}_{methodInfo.Name}";
            });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Enter a JWT bearer token",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header
            });

            c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            });
        });

        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Limits.MaxRequestBodySize = 30 * 1024 * 1024;
        });

        builder.Services.Configure<FormOptions>(options =>
        {
            options.MultipartBodyLengthLimit = 30 * 1024 * 1024;
        });

        var app = builder.Build();

        if (app.Environment.IsProduction())
        {
            var issuer = app.Configuration["JwtSettings:Issuer"] ?? "";
            var audience = app.Configuration["JwtSettings:Audience"] ?? "";
            if (issuer.Contains("localhost", StringComparison.OrdinalIgnoreCase) || audience.Contains("localhost", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Set JwtSettings__Issuer and JwtSettings__Audience to the public site before production.");

            var origins = app.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
            if (origins.Length == 0 || origins.All(origin => origin.Contains("localhost", StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException("Set Cors__Origins to the production frontend URL.");
        }

        app.UseExceptionHandler();
        app.UseForwardedHeaders();
        app.UseResponseCompression();
        app.UseMiddleware<SecurityHeadersMiddleware>();
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseHttpsRedirection();
        if (!app.Environment.IsDevelopment())
            app.UseHsts();

        app.UseCors("AllowOrigin");
        app.UseRateLimiter();
        app.UseMiddleware<NLogMiddleware>();
        app.UseStaticFiles();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseAuthentication();
        app.UseAuthorization();
        app.UseMiddleware<RequestTransactionMiddleware>();

        if (app.Environment.IsDevelopment())
            app.MapOpenApi().AllowAnonymous();

        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false
        }).AllowAnonymous();
        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready")
        }).AllowAnonymous();

        app.MapControllers();
        app.MapHub<ActivityHub>("/hubs/live");

        if (app.Environment.IsDevelopment())
        {
            using var scope = app.Services.CreateScope();
            DevelopmentSeeder.SeedAsync(scope.ServiceProvider).GetAwaiter().GetResult();
        }

        app.Run();
    }
}
