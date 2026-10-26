using Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.NightAudits;

public class NightAudit : BaseAuditableEntity
{
    public DateOnly BusinessDate { get; set; }
    public DateTime AuditTimestamp { get; set; }

    [StringLength(150)]
    public string AuditedBy { get; set; } = string.Empty;
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public decimal OccupancyRate { get; set; }
    public decimal RoomRevenue { get; set; }
    public decimal PosRevenue { get; set; }
    public decimal ServicesRevenue { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal Adr { get; set; }
    public decimal RevPar { get; set; }
    public decimal TotalGst { get; set; }
    public decimal CashSettlement { get; set; }
    public decimal UpiSettlement { get; set; }
    public decimal CardSettlement { get; set; }
    public decimal CorporateSettlement { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }
}
