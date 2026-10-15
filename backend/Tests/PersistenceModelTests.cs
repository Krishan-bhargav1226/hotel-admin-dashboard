using HotelAdmin.Domain.Entities;
using HotelAdmin.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HotelAdmin.Tests;

public sealed class PersistenceModelTests
{
    [Fact]
    public void Sql_server_model_maps_records_and_discovers_the_initial_migration()
    {
        var options = new DbContextOptionsBuilder<HotelDbContext>()
            .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=HotelAdminDb;Trusted_Connection=True")
            .Options;
        using var dbContext = new HotelDbContext(options);

        var entity = dbContext.Model.FindEntityType(typeof(HotelRecord));

        Assert.NotNull(entity);
        Assert.Equal("HotelRecords", entity.GetTableName());
        Assert.Contains("202610150001_InitialCreate", dbContext.Database.GetMigrations());
    }
}
