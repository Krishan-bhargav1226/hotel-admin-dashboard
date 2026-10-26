namespace Application.Interfaces.Repositories.SupportTicketDocuments;

public interface ITicketConversationDocumentRepository
{
    Task<bool> Create(int supportTicketId, int documentId);
    Task<bool> IsExists(int supportTicketId, int documentId);
    Task<List<int>> Delete(int supportTicketId);
    Task<bool> DeleteDocument(int supportTicketId, int documentId);
}
