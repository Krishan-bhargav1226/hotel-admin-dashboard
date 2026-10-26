using Domain.Entities.Documents;
using Domain.Entities.SupportTickets.TicketConversations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.SupportTickets.Documents;

public class TicketConversationDocument
{
    [ForeignKey("Document")]
    public int DocumentId { get; set; }
    public Document Document { get; set; }

    [ForeignKey("TicketConversation")]
    public int TicketConversationtId { get; set; }
    public TicketConversation TicketConversation { get; set; }
}
