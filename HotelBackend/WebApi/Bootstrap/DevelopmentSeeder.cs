using Domain.Common.Enums.Users;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Organizations;
using Microsoft.AspNetCore.Identity;
using Persistence.DataContext;

namespace WebApi.Bootstrap;

public static class DevelopmentSeeder
{
    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        var db = services.GetRequiredService<ApplicationDbContext>();

        if (!db.Organizations.Any())
        {
            db.Organizations.Add(new Organization
            {
                Name = configuration["SeedAdmin:Organization"] ?? "Hotel",
                IsApproved = true,
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            });
            await db.SaveChangesAsync(cancellationToken);
        }

        var organizationId = db.Organizations.OrderBy(x => x.Id).Select(x => x.Id).First();
        var roleManager = services.GetRequiredService<RoleManager<Role>>();
        foreach (var roleName in new[] { "SuperAdmin", "Admin", "Reception", "User" })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
                await roleManager.CreateAsync(new Role { Name = roleName, OrganizationId = organizationId });
        }

        var email = configuration["SeedAdmin:Email"];
        var password = configuration["SeedAdmin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        var userManager = services.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByEmailAsync(email);
        if (user != null)
            return;

        user = new User
        {
            UserName = email,
            Email = email,
            FirstName = configuration["SeedAdmin:FirstName"] ?? "Admin",
            LastName = configuration["SeedAdmin:LastName"] ?? "User",
            OrganizationId = organizationId,
            EmailConfirmed = true,
            UserType = UserType.Employee
        };
        var created = await userManager.CreateAsync(user, password);
        if (created.Succeeded)
            await userManager.AddToRoleAsync(user, "SuperAdmin");
    }
}
