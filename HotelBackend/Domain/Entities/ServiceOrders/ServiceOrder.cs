using Domain.Common;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.ServiceOrders;

public class ServiceOrder : BaseAuditableEntity
{
    [Required]
    [StringLength(20)]
    public string OrderNo { get; set; } = string.Empty;

    [ForeignKey("Room")]
    public int RoomId { get; set; }
    public Room? Room { get; set; }

    [StringLength(20)]
    public string RoomNumber { get; set; } = string.Empty;

    [ForeignKey("Stay")]
    public int? StayId { get; set; }
    public Stay? Stay { get; set; }

    [StringLength(150)]
    public string GuestName { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public bool BilledToRoom { get; set; }
    public PaymentMode? PaymentMode { get; set; }
    public ServiceOrderStatus Status { get; set; } = ServiceOrderStatus.PENDING;

    [StringLength(500)]
    public string? Notes { get; set; }
    public ICollection<ServiceOrderLine> Lines { get; set; } = new List<ServiceOrderLine>();
}
