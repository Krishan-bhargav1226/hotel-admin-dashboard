using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Application.Dto.SupportTickets;
using Domain.Entities.SupportTickets.Documents;
using Domain.Entities.SupportTickets.TicketConversations;

namespace Application.Dto.TicketConversations;

public class GetTicketConversationDto : BaseDto, IMapFrom<TicketConversation>
{
    public int Id { get; set; }
    public int SupportTicketId { get; set; }
    public GetSupportTicketDto SupportTicket { get; set; }
    public IdAndNameDto ResponseBy { get; set; }
    public string Subject { get; set; }
    public string Description { get; set; }
    public List<TicketConversationDocument>? Documents { get; set; }
}
