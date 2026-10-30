
using Application.Interfaces.GenericRepositories;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.Organization;
using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Repositories.Users.UserRoles;
using Application.Interfaces.Repositories.Users.UserRoles.Roles;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Persistence.Common.Behaviors;
using Persistence.DataContext;
using Persistence.Extension.Repositories;
using Persistence.Extension.Repositories.Organization;
using Persistence.Extension.Repositories.Otps;
using Persistence.Extension.Repositories.Roles;
using Persistence.Extension.Repositories.Roles.UserRoles;
using Persistence.Extension.Repositories.UserIdAndOrganizationIds;
using Persistence.Extensions.Repositories.Documents;
using System.Security.Claims;
using System.Text;

namespace Persistence.Extension;

public static class IServiceCollectionExtension
{
    public static void AddPersistenceLayer(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
    {
        services.AddDbContext(configuration, webHostEnvironment);
        services.AddRepository();
        services.AddDbUpdateExceptionBehavior();
        services.AddIdentityServices(configuration);
    }

    public static void AddDbUpdateExceptionBehavior(this IServiceCollection services)
    {
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(DbUpdateExceptionBehavior<,>));
    }

    public static void AddDbContext(this IServiceCollection services, IConfiguration configuration, Microsoft.AspNetCore.Hosting.IWebHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString,
                builder => builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
    }

    public static void AddRepository(this IServiceCollection services)
    {
        services.AddScoped(typeof(IUnitOfWork), typeof(UnitOfWork));
        services.AddScoped(typeof(IQueryContext), typeof(QueryContext));
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddTransient<ICurrentOrganizationProvider, CurrentOrganizationProvider>();
        services.AddTransient<IUserIdAndOrganizationIdRepository, UserIdAndOrganizationIdRepository>();
        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<ICreateDocumentPath, CreateDocumentPath>();
        services.AddScoped<IOtpRepository, OtpRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();
    }

    public static void AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {

        services.AddIdentity<User, Role>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Lockout.AllowedForNewUsers = true;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
         .AddDefaultTokenProviders();

        // Configure application cookies
        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Use HTTPS
            options.Cookie.SameSite = SameSiteMode.Lax; // Adjust based on your security needs
            options.SlidingExpiration = true;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        });

        var jwtSecret = configuration["JwtSettings:SecretKey"];
        if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
            throw new InvalidOperationException("JwtSettings:SecretKey must be at least 32 bytes. Supply it with user secrets or JwtSettings__SecretKey.");

        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["JwtSettings:Issuer"],
                ValidAudience = configuration["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                RoleClaimType = ClaimTypes.Role,
                ClockSkew = TimeSpan.FromMinutes(1)
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        context.Token = accessToken;
                    return Task.CompletedTask;
                },
                OnTokenValidated = async context =>
                {
                    var purpose = context.Principal?.FindFirst("purpose")?.Value;
                    if (!string.IsNullOrEmpty(purpose))
                    {
                        context.Fail("This token cannot access the API.");
                        return;
                    }

                    var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
                    var userId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var stamp = context.Principal?.FindFirst("SecurityStamp")?.Value;
                    var user = string.IsNullOrEmpty(userId) ? null : await userManager.FindByIdAsync(userId);
                    if (user == null || user.IsDeleted || !user.IsActive || !string.Equals(user.SecurityStamp, stamp, StringComparison.Ordinal))
                        context.Fail("Token is no longer valid.");
                }
            };
        })
        .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.SlidingExpiration = true;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        });

        var googleClientId = configuration["Auth:Google:ClientID"];
        var googleClientSecret = configuration["Auth:Google:ClientSecret"];
        if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
        {
            authBuilder.AddGoogle(options =>
            {
                options.ClientId = googleClientId;
                options.ClientSecret = googleClientSecret;
                options.Scope.Add("email");
                options.Scope.Add("profile");
                options.SaveTokens = true;
            });
        }

        var linkedInClientId = configuration["Auth:LinkedIn:ClientId"];
        var linkedInClientSecret = configuration["Auth:LinkedIn:ClientSecret"];
        if (!string.IsNullOrWhiteSpace(linkedInClientId) && !string.IsNullOrWhiteSpace(linkedInClientSecret))
        {
            authBuilder.AddLinkedIn(options =>
            {
                options.ClientId = linkedInClientId;
                options.ClientSecret = linkedInClientSecret;
                options.CallbackPath = new PathString("/signin-LinkedIn"); // Make sure this matches LinkedIn's registered redirect URI
                options.Scope.Add("r_liteprofile");
                options.Scope.Add("r_emailaddress");
                options.SaveTokens = true;
            });
        }
    }
}
