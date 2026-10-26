using Domain.Entities.Documents;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Templates;

public class TemplateDocument
{
    [ForeignKey("Document")]
    public int DocumentId { get; set; }
    public Document Document { get; set; }

    [ForeignKey("Template")]
    public int TemplateId { get; set; }
    public Template Template { get; set; }
}
