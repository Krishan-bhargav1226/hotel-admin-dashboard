using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.Documents;

public class DocumentType
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
}
