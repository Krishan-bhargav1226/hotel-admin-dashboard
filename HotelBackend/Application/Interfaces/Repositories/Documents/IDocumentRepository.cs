using Domain.Entities.Documents;
using Microsoft.AspNetCore.Http;
namespace Application.Interfaces.Repositories.Documents.CreateDocuments;

public interface IDocumentRepository
{
    Task<Document> Create(IFormFile from, int? documentTypeId = null, string? remark = null);
}
