using Domain.Common;
using Domain.Entities.Hotels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.ServiceOrders;

public class ServiceOrderLine : BaseAuditableEntity
{
    [ForeignKey("ServiceOrder")]
    public int ServiceOrderId { get; set; }
    public ServiceOrder? ServiceOrder { get; set; }
    public int PosItemId { get; set; }

    [StringLength(150)]
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public MenuCategory Category { get; set; }
}
