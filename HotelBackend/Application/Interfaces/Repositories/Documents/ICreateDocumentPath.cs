using Microsoft.AspNetCore.Http;

namespace Application.Interfaces.Repositories.Documents;

public interface ICreateDocumentPath
{
    Task<string> Create(IFormFile file);
    void DeleteDocument(string url);
}
