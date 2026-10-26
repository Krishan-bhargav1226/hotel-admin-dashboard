using Domain.Common;
using Domain.Common.Enums;
using Domain.Common.Enums.PriorityTypes;
using Domain.Common.Enums.RequestedSources;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.SupportTickets.Documents;
using Domain.Entities.SupportTickets.TicketConversations;
using Domain.Entities.SupportTickets.TicketTypes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.SupportTickets;

public class SupportTicket : BaseAuditableEntity
{
    public string Code { get; set; } = string.Empty;

    [ForeignKey("User")]
    public string? RequestById { get; set; }
    public User RequestBy { get; set; }
    public RequestedSourceType RequestedSource { get; set; }

    [ForeignKey("TicketType")]
    public int? TicketTypeId { get; set; }
    public TicketType TicketType { get; set; }
    public int RequestOrganizationId { get; set; }
    public DateTime CreatedOn { get; set; }
    public PriorityType? Priority { get; set; }
    public SupportStatus Status { get; set; }

    //[ForeignKey("Department")]
    //public int? DepartmentId { get; set; }
    //public Department Department { get; set; }

    //[ForeignKey("Employee")]
    public string? AssignedToId { get; set; }
    //public Employee Employee { get; set; }
    public string? AssignedById { get; set; }
    public string? ResolveBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string Subject { get; set; }
    public string Description { get; set; }
    public List<TicketConversationDocument> Documents { get; set; }
    public List<TicketConversation> TicketConversations { get; set; }
    public string? Name { get; set; }

    [EmailAddress(ErrorMessage = "Email is not valid.")]
    public string? Email { get; set; }
    public long? Phone { get; set; }
    public long? AlternetPhone { get; set; }
}
