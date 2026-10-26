using Application.Interfaces.Repositories.SupportTicketDocuments;
using Domain.Entities.SupportTickets.Documents;
using Microsoft.EntityFrameworkCore;
using Persistence.DataContext;

namespace Persistence.Extension.Repositories.TicketConversationDocuments;

public class TicketConversationDocumentRepository : ITicketConversationDocumentRepository
{
    private readonly ApplicationDbContext _context;

    public TicketConversationDocumentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Create(int ticketConversationId, int documentId)
    {
        var ticketConversationDocument = new TicketConversationDocument()
        {
            TicketConversationtId = ticketConversationId,
            DocumentId = documentId
        };

        await _context.TicketConversationDocuments.AddAsync(ticketConversationDocument);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<int>> Delete(int ticketConversationId)
    {
        var data = await _context.TicketConversationDocuments.Where(x => x.TicketConversationtId == ticketConversationId).ToListAsync();

        if (data == null)
        {
            return null;
        }

        _context.TicketConversationDocuments.RemoveRange(data);
        await _context.SaveChangesAsync();

        return data.Select(x => x.DocumentId).ToList();
    }

    public async Task<bool> DeleteDocument(int ticketConversationId, int documentId)
    {
        var data = await _context.TicketConversationDocuments.Where(x => x.TicketConversationtId == ticketConversationId && x.DocumentId == documentId).FirstOrDefaultAsync();

        if (data == null)
        {
            return false;
        }

        _context.TicketConversationDocuments.Remove(data);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> IsExists(int ticketConversationId, int documentId)
    {
        var document = await _context.TicketConversationDocuments.Where(x => x.TicketConversationtId == ticketConversationId && x.DocumentId == documentId).ToListAsync();

        var documentIds = document.Select(x => x.DocumentId).ToList();

        var documentsToDelete = await _context.Documents
                                              .Where(x => documentIds.Contains(x.Id))
                                              .ToListAsync();

        _context.TicketConversationDocuments.RemoveRange(document);
        _context.Documents.RemoveRange(documentsToDelete);

        await _context.SaveChangesAsync();
        return true;
    }
}

