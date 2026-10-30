using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Persistence.DataContext;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        var candidates = new[]
        {
            Directory.GetCurrentDirectory(),
            Path.Combine(Directory.GetCurrentDirectory(), "WebApi"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "WebApi")
        };

        var basePath = candidates.First(path => File.Exists(Path.Combine(path, "appsettings.json")));
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString, builder => builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
            .Options;

        return new ApplicationDbContext(options, new DesignTimeOrganizationProvider());
    }

    private sealed class DesignTimeOrganizationProvider : ICurrentOrganizationProvider
    {
        public List<int> GetOrganizationIds() => [1];
    }
}
