using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Maintenances;

namespace Application.Dto.Maintenances;

public class GetMaintenanceTicketDto : BaseDto, IMapFrom<MaintenanceTicket>
{
    public string TicketNo { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public MaintenancePriority Priority { get; set; }
    public MaintenanceStatus Status { get; set; }
    public string? ReportedBy { get; set; }
    public string? AssignedTo { get; set; }
    public decimal Cost { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
