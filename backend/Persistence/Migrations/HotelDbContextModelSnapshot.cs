using HotelAdmin.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

#nullable disable

namespace HotelAdmin.Persistence.Migrations;

[DbContext(typeof(HotelDbContext))]
public sealed class HotelDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasAnnotation("ProductVersion", "10.0.2")
            .HasAnnotation("Relational:MaxIdentifierLength", 128);

        SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

        modelBuilder.Entity<HotelRecord>(entity =>
        {
            entity.HasKey(record => record.Key);
            entity.ToTable("HotelRecords");
            entity.Property(record => record.Key).HasMaxLength(160);
            entity.Property(record => record.JsonValue).HasColumnType("nvarchar(max)");
            entity.Property(record => record.UpdatedAt).HasColumnType("datetimeoffset");
        });
    }
}
