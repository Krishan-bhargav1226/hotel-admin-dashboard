using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Domain.Entities.ApplicationRoles;
using Persistence.Common.Services;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.Documents;
using Domain.Entities.Employees;
using Domain.Entities.Locations;
using Domain.Entities.Menus;
using Domain.Entities.MenuTypes;
using Domain.Entities.Organizations;
using Domain.Entities.OTPs;
using Domain.Entities.Roles.RoleClaims;
using Domain.Entities.SupportTickets;
using Domain.Entities.SupportTickets.Documents;
using Domain.Entities.SupportTickets.TicketConversations;
using Domain.Entities.SupportTickets.TicketTypes;
using Domain.Entities.SystemLogs;
using Domain.Entities.Templates;
using Domain.Entities.Templates.TemplateTypes;
using Domain.Entities.Users.UserRoles;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;
using Shared;

namespace Persistence.DataContext;

public partial class ApplicationDbContext : IdentityDbContext<User, Role, string, IdentityUserClaim<string>, UserRole, IdentityUserLogin<string>, RoleClaim, IdentityUserToken<string>>
{
    private readonly IReadOnlyCollection<int> _currentOrgIds;
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentOrganizationProvider currentOrganizationProvider) : base(options)
    {
        _currentOrgIds = currentOrganizationProvider.OrganizationIds.ToList();
    }

    public DbSet<Organization> Organizations { get; set; }
    public DbSet<SystemLog> SystemLogs { get; set; }
    public DbSet<Menu> Menus { get; set; }
    public DbSet<MenuType> MenuTypes { get; set; }
    public DbSet<OTP> OTPs { get; set; }
    public DbSet<Template> Templates { get; set; }
    public DbSet<TemplateBody> TemplateBodies { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<DocumentType> DocumentTypes { get; set; }
    public DbSet<TemplateType> TemplateTypes { get; set; }
    public DbSet<TemplateDocument> TemplateDocuments { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<TicketType> TicketTypes { get; set; }
    public DbSet<SupportTicket> SupportTickets { get; set; }
    public DbSet<TicketConversation> TicketConversations { get; set; }
    public DbSet<TicketConversationDocument> TicketConversationDocuments { get; set; }


    public IReadOnlyCollection<int> CurrentOrgIds => _currentOrgIds;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        ConfigureHotelEntities(modelBuilder);



        modelBuilder.Entity<RoleClaim>()
        .HasOne(rc => rc.Role)
        .WithMany(r => r.RoleMenus)
        .HasForeignKey(rc => rc.RoleId);

        modelBuilder.Entity<RoleClaim>()
            .HasOne(rc => rc.Menu)
            .WithMany()
            .HasForeignKey(rc => rc.MenuId);


        modelBuilder.Entity<Role>()
            .HasIndex(r => r.NormalizedName)
            .IsUnique(false);

        modelBuilder.Entity<TemplateDocument>()
             .HasKey(x => new { x.TemplateId, x.DocumentId });

        modelBuilder.Entity<TicketConversationDocument>()
             .HasKey(x => new { x.TicketConversationtId, x.DocumentId });

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

            // Skip organization filter for the Organization entity itself
            var isOrganizationEntity = clrType == typeof(Organization); // or your actual Organization class
            var orgIdProp = clrType.GetProperty("OrganizationId");

            // 1️⃣ IsDeleted filter
            var isDeletedProp = clrType.GetProperty("IsDeleted");
            if (isDeletedProp != null && isDeletedProp.PropertyType == typeof(bool))
            {
                var isDeletedProperty = Expression.Property(parameter, isDeletedProp);
                var isDeletedFalse = Expression.Equal(isDeletedProperty, Expression.Constant(false));
                filterExpression = isDeletedFalse;
            }

            // 2️⃣ OrganizationId filter (skip Organization table itself)
            if (!isOrganizationEntity && orgIdProp != null && orgIdProp.PropertyType == typeof(int))
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

            // Apply filter if exists
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
