using HotelAdmin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelAdmin.Persistence;

public sealed class HotelDbContext(DbContextOptions<HotelDbContext> options) : DbContext(options)
{
    public DbSet<HotelRecord> HotelRecords => Set<HotelRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<HotelRecord>(entity =>
        {
            entity.ToTable("HotelRecords");
            entity.HasKey(record => record.Key);
            entity.Property(record => record.Key).HasMaxLength(160).IsRequired();
            entity.Property(record => record.JsonValue).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(record => record.UpdatedAt).IsRequired();
        });
    }
}
