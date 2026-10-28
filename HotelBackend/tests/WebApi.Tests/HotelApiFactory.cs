using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace WebApi.Tests;

public sealed class HotelApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("JwtSettings:SecretKey", "integration-test-signing-key-32chars");
        builder.UseSetting("JwtSettings:Issuer", "https://localhost:5001");
        builder.UseSetting("JwtSettings:Audience", "https://localhost:5001");

        var developmentSettings = Path.GetFullPath(Path.Combine(
            AppContext.BaseDirectory,
            "..", "..", "..", "..", "..",
            "WebApi",
            "appsettings.Development.json"));
        if (File.Exists(developmentSettings))
        {
            var connectionString = new ConfigurationBuilder()
                .AddJsonFile(developmentSettings)
                .Build()
                .GetConnectionString("DefaultConnection");
            if (!string.IsNullOrWhiteSpace(connectionString))
                builder.UseSetting("ConnectionStrings:DefaultConnection", connectionString);
        }

        builder.UseSetting("Auth:OtpRoles:0", "");
    }
}
