using Domain.Common;
using Domain.Entities.Templates.TemplateTypes;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Templates;

public class Template : BaseAuditableEntity
{
    public string Subject { get; set; }

    [ForeignKey("TemplateType")]
    public int TypeId { get; set; }
    public TemplateType TemplateType { get; set; }

    public bool IsActive { get; set; } = false;
    public List<TemplateDocument> Documents { get; set; }
    public TemplateBody TemplateBody { get; set; }
}
