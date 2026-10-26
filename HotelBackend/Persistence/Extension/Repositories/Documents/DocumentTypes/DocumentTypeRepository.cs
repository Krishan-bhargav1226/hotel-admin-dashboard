using Application.Interfaces.Repositories.Documents.DocumentTypes;
using Domain.Entities.Documents;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories.Documents.DocumentTypes;

public class DocumentTypeRepository : IDocumentTypeRepository
{
    private readonly ApplicationDbContext _context;

    public DocumentTypeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DocumentType> GetByIdAsync(int id)
    {
        var data = await _context.DocumentTypes.FirstOrDefaultAsync(x => x.Id == id);

        return data;

    }

    public async Task<DocumentType> GetByName(string name)
    {
        var data = await _context.DocumentTypes.Where(x => x.Name.ToLower() == name.ToLower()).FirstOrDefaultAsync();

        return data;
    }

    public async Task<List<DocumentType>> GetDocumentTypesAsync()
    {
        var data = await _context.DocumentTypes.ToListAsync();

        return data;
    }
}
