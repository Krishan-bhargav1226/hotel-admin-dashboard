
using Application.Interfaces.GenericRepositories;
using MediatR;
using Persistence.Common.Behaviors;
using Application.Interfaces.Repositories.Claims;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.Documents.CreateDocuments;
using Application.Interfaces.Repositories.Documents.DocumentTypes;
using Application.Interfaces.Repositories.Locations;
using Application.Interfaces.Repositories.Menus;
using Application.Interfaces.Repositories.Organization;
using Application.Interfaces.Repositories.Otps;
using Application.Interfaces.Repositories.SupportTicketDocuments;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.Repositories.Users.UserRoles;
using Application.Interfaces.Repositories.Users.UserRoles.Roles;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Persistence.Extension.Repositories.Organization;
using Persistence.DataContext;
using Persistence.Extension.Repositories;
using Persistence.Extension.Repositories.Claims;
using Persistence.Extension.Repositories.Documents.CreateDocuments;
using Persistence.Extension.Repositories.Documents.DocumentTypes;
using Persistence.Extension.Repositories.Menus;
using Persistence.Extension.Repositories.Otps;
using Persistence.Extension.Repositories.Roles;
using Persistence.Extension.Repositories.Roles.UserRoles;
using Persistence.Extension.Repositories.TicketConversationDocuments;
using Persistence.Extension.Repositories.UserIdAndOrganizationIds;
using Persistence.Extensions.Repositories.Documents;
using Persistence.Extensions.Repositories.Locations;
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
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>))
        .AddTransient<ICurrentOrganizationProvider, CurrentOrganizationProvider>()
       .AddTransient<IUserIdAndOrganizationIdRepository, UserIdAndOrganizationIdRepository>()
       .AddScoped<IOrganizationRepository, OrganizationRepository>()
       .AddScoped<ICreateDocumentPath, CreateDocumentPath>()
       .AddScoped<IOtpRepository, OtpRepository>()
       .AddScoped<IRoleRepository, RoleRepository>()
       .AddScoped<IUserRoleRepository, UserRoleRepository>()
       .AddScoped<IClaimRepository, ClaimRepository>()
       .AddScoped<IMenuRepository, MenuRepository>()
       .AddScoped<ILocationRepository, LocationRepository>()
       .AddScoped<IDocumentTypeRepository, DocumentTypeRepository>()
       .AddScoped<IDocumentRepository, DocumentRepository>()
       .AddScoped<ITicketConversationDocumentRepository, TicketConversationDocumentRepository>()

        ;

    }

    public static void AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {

        services.AddIdentity<User, Role>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 6;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
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
                RoleClaimType = ClaimTypes.Role

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
