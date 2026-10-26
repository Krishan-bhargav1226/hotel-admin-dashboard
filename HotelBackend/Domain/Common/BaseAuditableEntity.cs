using Domain.Common.Interfaces;
using Domain.Entities.Organizations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Common;

public class BaseAuditableEntity : BaseEntity, IAuditableEntity
{
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }

    [ForeignKey("Organization")]
    public int OrganizationId { get; set; }
    public Organization Organization { get; set; }
}