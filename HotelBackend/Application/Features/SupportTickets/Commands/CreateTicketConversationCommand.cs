using Application.Interfaces.Repositories.Documents.CreateDocuments;
using Application.Interfaces.Repositories.SupportTicketDocuments;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Responses;
using Domain.Entities.ApplicationUsers;
using Domain.Entities.SupportTickets;
using Domain.Entities.SupportTickets.TicketConversations;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Commands;

public class CreateTicketConversationCommand : IRequest<Result<TicketConversation>>
{
    public int SupportTicketId { get; set; }
    public ResponseBy ResponseBy { get; set; }
    public string? Subject { get; set; }
    public string Description { get; set; }
    public List<IFormFile>? Documents { get; set; }



}
internal class CreateTicketConversationCommandHandler : IRequestHandler<CreateTicketConversationCommand, Result<TicketConversation>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IDocumentRepository _documentRepository;
    private readonly ITicketConversationDocumentRepository _supportTicketDocumentRepository;
    private readonly UserManager<User> _userManager;

    public CreateTicketConversationCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository, IDocumentRepository documentRepository, ITicketConversationDocumentRepository supportTicketDocumentRepository, UserManager<User> userManager)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _documentRepository = documentRepository;
        _supportTicketDocumentRepository = supportTicketDocumentRepository;
        _userManager = userManager;
    }

    //private readonly IHubContext<ChatHub> _hubContext;


    public async Task<Result<TicketConversation>> Handle(CreateTicketConversationCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userIdAndOrganizationIdRepository.Get();

        var supportTicketId = await _unitOfWork.Repository<SupportTicket>().GetByID(request.SupportTicketId);

        if (supportTicketId == null)
        {
            return Result<TicketConversation>.BadRequest("supportTicketId doesn't exist.");
        }

        if (supportTicketId.RequestById == null)
        {
            return Result<TicketConversation>.BadRequest("This ticket cannot be replied to because it was not created by a registered user.");
        }

        if (supportTicketId.RequestById != userOrg.UserId && !userOrg.IsAdmin)
        {
            return Result<TicketConversation>.BadRequest("Permission denied.");
        }

        var user = await _userManager.Users.Include(x => x.UserRoles).ThenInclude(x => x.Role).FirstOrDefaultAsync(x => x.Id == userOrg.UserId);


        var ticketConversation = new TicketConversation
        {
            SupportTicketId = request.SupportTicketId,
            Subject = request.Subject,
            Description = request.Description
        };

        if (user?.UserRoles != null && user.UserRoles.Any(x => x.Role.Id == "f8084747-27b2-4da7-be9d-d691863751b2"))
        {
            ticketConversation.ResponseBy = ResponseBy.Admin;
        }
        else
        {
            ticketConversation.ResponseBy = ResponseBy.User;
        }

        await _unitOfWork.Repository<TicketConversation>().AddAsync(ticketConversation);
        await _unitOfWork.Save(cancellationToken);


        if (request.Documents != null)
        {
            foreach (var i in request.Documents)
            {
                var document = await _documentRepository.Create(i, 1);
                await _supportTicketDocumentRepository.Create(ticketConversation.Id, document.Id);
            }
        }

        //await _hubContext.Clients.Group(request.SupportTicketId.ToString())
        //    .SendAsync("ReceiveMessage", new
        //    {
        //        TicketId = request.SupportTicketId,
        //        ticketConversation.Id,
        //        //ticketConversation.SupportTicketId,
        //        ticketConversation.Subject,
        //        ticketConversation.Description,
        //        ticketConversation.ResponseBy,
        //        CreatedDate = DateTime.UtcNow
        //    });

        return Result<TicketConversation>.Success("Ticket Conversation Created Successfully.");
    }
}

