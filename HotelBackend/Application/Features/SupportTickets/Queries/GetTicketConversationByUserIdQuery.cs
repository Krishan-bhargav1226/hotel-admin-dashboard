using Application.Dto.TicketConversations;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.SupportTickets.TicketConversations;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Queries;

public class GetTicketConversationByUserIdQuery : IRequest<Result<List<GetTicketConversationDto>>>
{
    public string UserId { get; set; }

    public GetTicketConversationByUserIdQuery(string userId)
    {
        UserId = userId;
    }
}

internal class GetTicketConversationByUserIdQueryHandler
    : IRequestHandler<GetTicketConversationByUserIdQuery, Result<List<GetTicketConversationDto>>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetTicketConversationByUserIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<List<GetTicketConversationDto>>> Handle(GetTicketConversationByUserIdQuery request, CancellationToken cancellationToken)
    {
        var ticketConversations = await _queryContext.Repository<TicketConversation>().Entities
            .Where(x => x.SupportTicket.RequestById == request.UserId)
            .Include(x=>x.Documents).ThenInclude(x=>x.Document)
            .ToListAsync(cancellationToken);

        if (ticketConversations == null || !ticketConversations.Any())
        {
            return Result<List<GetTicketConversationDto>>.BadRequest($"No conversations found for User Id: {request.UserId}");
        }

        var mapData = _mapper.Map<List<GetTicketConversationDto>>(ticketConversations);

        return Result<List<GetTicketConversationDto>>.Success(mapData, "Ticket conversations fetched successfully");
    }
}
