using Application.Extensions;
using Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http.Features;
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

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddOpenApi();
        builder.Services.AddProblemDetails();
        builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
        builder.Services.AddResponseCompression();
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
                return apiDesc.TryGetMethodInfo(out MethodInfo methodInfo) ? methodInfo.Name : null;
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

        app.UseExceptionHandler();
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
        app.UseMiddleware<RequestTransactionMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.MapOpenApi().AllowAnonymous();
        }

        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false
        }).AllowAnonymous();
        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready")
        }).AllowAnonymous();

        app.MapControllers();

        if (app.Environment.IsDevelopment())
        {
            using var scope = app.Services.CreateScope();
            DevelopmentSeeder.SeedAsync(scope.ServiceProvider).GetAwaiter().GetResult();
        }

        app.Run();
    }
}
