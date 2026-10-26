using Domain.Common;
using Domain.Entities.Rooms;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Stays;

public class StayRoom : BaseAuditableEntity
{
    [ForeignKey("Stay")]
    public int StayId { get; set; }
    public Stay? Stay { get; set; }

    [ForeignKey("Room")]
    public int RoomId { get; set; }
    public Room? Room { get; set; }
}
