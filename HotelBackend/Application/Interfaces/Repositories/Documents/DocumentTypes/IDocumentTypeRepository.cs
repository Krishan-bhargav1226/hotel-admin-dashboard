using Domain.Entities.Documents;

namespace Application.Interfaces.Repositories.Documents.DocumentTypes;

public interface IDocumentTypeRepository
{
    Task<List<DocumentType>> GetDocumentTypesAsync();
    Task<DocumentType> GetByName(string name);
    Task<DocumentType> GetByIdAsync(int id);
}
