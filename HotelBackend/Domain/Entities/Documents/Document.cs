using Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Documents;

public class Document : BaseAuditableEntity
{
    public string? Name { get; set; }
    public string Url { get; set; }
    public string? Remark { get; set; }

    [ForeignKey("DocumentType")]
    public int? DocumentTypeId { get; set; }
    public DocumentType? DocumentType { get; set; }
}
