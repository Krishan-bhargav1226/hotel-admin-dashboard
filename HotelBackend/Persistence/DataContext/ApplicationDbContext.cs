using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationRoles;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.OTPs;
using Domain.Entities.Organizations;
using Domain.Entities.Roles.RoleClaims;
using Domain.Entities.Users.UserRoles;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Persistence.Common.Services;
using Shared;
using System.Linq.Expressions;
using System.Reflection;

namespace Persistence.DataContext;

public partial class ApplicationDbContext : IdentityDbContext<User, Role, string, IdentityUserClaim<string>, UserRole, IdentityUserLogin<string>, RoleClaim, IdentityUserToken<string>>
{
    private readonly ICurrentOrganizationProvider _currentOrganizationProvider;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentOrganizationProvider currentOrganizationProvider) : base(options)
    {
        _currentOrganizationProvider = currentOrganizationProvider;
    }

    public DbSet<Organization> Organizations { get; set; }
    public DbSet<OTP> OTPs { get; set; }
    public IReadOnlyCollection<int> CurrentOrgIds => _currentOrganizationProvider.OrganizationIds;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        ConfigureHotelEntities(modelBuilder);

        modelBuilder.Entity<RoleClaim>()
            .HasOne(rc => rc.Role)
            .WithMany(r => r.RoleMenus)
            .HasForeignKey(rc => rc.RoleId);

        modelBuilder.Entity<Role>()
            .HasIndex(r => r.NormalizedName)
            .IsUnique(false);

        modelBuilder.Entity<User>()
            .HasOne(user => user.Property)
            .WithMany()
            .HasForeignKey(user => user.PropertyId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<OTP>()
            .HasOne(otp => otp.User)
            .WithMany()
            .HasForeignKey(otp => otp.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<UserRole>(builder =>
        {
            builder.HasKey(ur => new { ur.UserId, ur.RoleId });

            builder.HasOne(ur => ur.User)
                   .WithMany(u => u.UserRoles)
                   .HasForeignKey(ur => ur.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ur => ur.Role)
                   .WithMany(r => r.UserRoles)
                   .HasForeignKey(ur => ur.RoleId)
                   .OnDelete(DeleteBehavior.Cascade);
        });

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;
            var parameter = Expression.Parameter(clrType, "e");
            Expression? filterExpression = null;

            var skipOrganizationFilter = clrType == typeof(Organization)
                || clrType == typeof(User)
                || clrType == typeof(Role)
                || clrType == typeof(UserRole)
                || clrType == typeof(RoleClaim)
                || clrType == typeof(OTP);

            var isDeletedProp = clrType.GetProperty("IsDeleted");
            if (isDeletedProp != null && isDeletedProp.PropertyType == typeof(bool))
            {
                var isDeletedProperty = Expression.Property(parameter, isDeletedProp);
                filterExpression = Expression.Equal(isDeletedProperty, Expression.Constant(false));
            }

            var orgIdProp = clrType.GetProperty("OrganizationId");
            if (!skipOrganizationFilter && orgIdProp != null && orgIdProp.PropertyType == typeof(int))
            {
                var idsExpression = Expression.Property(Expression.Constant(this), nameof(CurrentOrgIds));
                var organizationIdProperty = Expression.Property(parameter, orgIdProp);
                var containsMethod = typeof(Enumerable)
                    .GetMethods()
                    .First(m => m.Name == "Contains" && m.GetParameters().Length == 2)
                    .MakeGenericMethod(typeof(int));
                var containsExpression = Expression.Call(containsMethod, idsExpression, organizationIdProperty);

                filterExpression = filterExpression == null
                    ? containsExpression
                    : Expression.AndAlso(filterExpression, containsExpression);
            }

            if (filterExpression != null)
            {
                var lambda = Expression.Lambda(filterExpression, parameter);
                modelBuilder.Entity(clrType).HasQueryFilter(lambda);
            }
        }
    }

    public override int SaveChanges()
    {
        try
        {
            return base.SaveChanges();
        }
        catch (DbUpdateException ex)
        {
            throw new ConstraintViolationException(EfConstraintErrorExtractor.ExtractOrFallback(ex), ex);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            throw new ConstraintViolationException(EfConstraintErrorExtractor.ExtractOrFallback(ex), ex);
        }
    }
}
