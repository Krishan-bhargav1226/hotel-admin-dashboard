using Domain.Common;
using Domain.Entities.RoomTypes;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.RatePlans;

public class RatePlanRoom : BaseAuditableEntity
{
    [ForeignKey("RatePlan")]
    public int RatePlanId { get; set; }
    public RatePlan? RatePlan { get; set; }

    [ForeignKey("RoomType")]
    public int RoomTypeId { get; set; }
    public RoomType? RoomType { get; set; }
}
