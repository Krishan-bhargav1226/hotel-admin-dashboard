using Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Templates;

public class TemplateBody : BaseAuditableEntity
{
    [ForeignKey("Template")]
    public int TemplateId { get; set; }
    public Template Template { get; set; }
    public string Body { get; set; }
}
