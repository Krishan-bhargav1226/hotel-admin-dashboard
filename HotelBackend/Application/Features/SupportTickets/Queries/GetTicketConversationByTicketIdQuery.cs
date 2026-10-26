using Application.Dto.TicketConversations;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.SupportTickets.TicketConversations;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Queries;
public class GetTicketConversationByTicketIdQuery : IRequest<Result<List<GetTicketConversationDto>>>
{
    public int Id { get; set; }

    public GetTicketConversationByTicketIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetTicketConversationByTicketIdQueryHandler
    : IRequestHandler<GetTicketConversationByTicketIdQuery, Result<List<GetTicketConversationDto>>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userOrganization;
    public GetTicketConversationByTicketIdQueryHandler(IQueryContext queryContext, IMapper mapper, IUserIdAndOrganizationIdRepository userOrganization)
    {
        _queryContext = queryContext;
        _mapper = mapper;
        _userOrganization = userOrganization;
    }

    public async Task<Result<List<GetTicketConversationDto>>> Handle(GetTicketConversationByTicketIdQuery request, CancellationToken cancellationToken)
    {
        var useOrga = await _userOrganization.Get();

        if (useOrga.UserId == null || useOrga.UserId == "")
        {
            return Result<List<GetTicketConversationDto>>.BadRequest("Permission denied!");
        }

        var ticketConversations = await _queryContext.Repository<TicketConversation>().Entities
            .Where(x => x.SupportTicketId == request.Id)
            .Include(x => x.SupportTicket).ThenInclude(x => x.RequestBy)
             .Include(x => x.Documents).ThenInclude(x => x.Document)
             //.Include(x=>x.dep)
             .Where(x => useOrga.IsAdmin || useOrga.UserId == x.SupportTicket.RequestById)
            .ToListAsync(cancellationToken);

        if (ticketConversations == null)
        {
            return Result<List<GetTicketConversationDto>>.BadRequest($"No conversations found for Ticket Id: {request.Id}");
        }

        var mapData = _mapper.Map<List<GetTicketConversationDto>>(ticketConversations);

        return Result<List<GetTicketConversationDto>>.Success(mapData, "Ticket conversations are...");
    }
}
