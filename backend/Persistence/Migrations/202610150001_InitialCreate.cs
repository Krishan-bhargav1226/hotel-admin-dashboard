using HotelAdmin.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelAdmin.Persistence.Migrations;

[DbContext(typeof(HotelDbContext))]
[Migration("202610150001_InitialCreate")]
public sealed class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "HotelRecords",
            columns: table => new
            {
                Key = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                JsonValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
            },
            constraints: table => table.PrimaryKey("PK_HotelRecords", record => record.Key));
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropTable(name: "HotelRecords");
}
