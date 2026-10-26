using Domain.Common;
using Domain.Entities.Organizations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Templates.TemplateTypes;

public class TemplateType : BaseAuditableEntity
{
    public string Name { get; set; }
}
