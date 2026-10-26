using Domain.Common;
using Domain.Common.Enums.Responses;
using Domain.Entities.SupportTickets.Documents;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.SupportTickets.TicketConversations;

public class TicketConversation : BaseAuditableEntity
{
    [ForeignKey("SupportTicket")]
    public int SupportTicketId { get; set; }
    public SupportTicket SupportTicket { get; set; }
    public ResponseBy ResponseBy { get; set; }
    public string? Subject { get; set; }
    public string Description { get; set; }
    public List<TicketConversationDocument>? Documents { get; set; }
}
