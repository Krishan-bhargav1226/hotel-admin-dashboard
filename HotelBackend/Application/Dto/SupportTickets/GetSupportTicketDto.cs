using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Application.Dto.Tickets;
using Application.Dto.Users.GetUserDtos;
using Domain.Entities.Employees;
using Domain.Entities.SupportTickets;
using Domain.Entities.SupportTickets.Documents;

namespace Application.Dto.SupportTickets;

public class GetSupportTicketDto : IMapFrom<SupportTicket>
{
    public int Id { get; set; }
    public string Code { get; set; }
    public GetUserDto RequestBy { get; set; }
    public IdAndNameDto RequestedSource { get; set; }
    public int TicketTypeId { get; set; }
    public GetTicketTypeDto TicketType { get; set; }
    public int RequestOrganizationId { get; set; }
    public DateTime CreatedOn { get; set; }
    public IdAndNameDto Priority { get; set; }
    public IdAndNameDto Status { get; set; }
    public string? AssignedToId { get; set; }
    public Employee? AssignTo { get; set; }
    public string? AssignedById { get; set; }
    public DateTime? ResolveBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string Subject { get; set; }
    public string Description { get; set; }
    public List<TicketConversationDocument> Documents { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public long Phone { get; set; }
    public long AlternetPhone { get; set; }
}
