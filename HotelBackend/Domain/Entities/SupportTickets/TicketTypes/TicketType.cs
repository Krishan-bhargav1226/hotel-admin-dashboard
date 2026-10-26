using Domain.Common;

namespace Domain.Entities.SupportTickets.TicketTypes
{
    public class TicketType : BaseAuditableEntity
    {
        public string Name { get; set; }
    }
}
