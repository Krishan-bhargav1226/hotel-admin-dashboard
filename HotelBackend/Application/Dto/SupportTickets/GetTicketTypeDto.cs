using Application.Common.Mappings.Commons;
using Domain.Entities.SupportTickets.TicketTypes;

namespace Application.Dto.Tickets;

public class GetTicketTypeDto : IMapFrom<TicketType>
{
    public int Id { get; set; }
    public string Name { get; set; }
}

