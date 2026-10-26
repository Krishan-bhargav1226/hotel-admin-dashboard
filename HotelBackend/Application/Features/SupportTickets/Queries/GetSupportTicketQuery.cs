using Application.Dto.SupportTickets;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.SupportTickets;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Queries;

public class GetSupportTicketQuery : IRequest<Result<List<GetSupportTicketDto>>>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetSupportTicketQueryHandler : IRequestHandler<GetSupportTicketQuery, Result<List<GetSupportTicketDto>>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetSupportTicketQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<List<GetSupportTicketDto>>> Handle(GetSupportTicketQuery request, CancellationToken cancellationToken)
    {

        var supportTickets = await _queryContext.Repository<SupportTicket>().Entities
            .Include(x => x.RequestBy)
            .Include(x => x.TicketType)
            .Include(x => x.TicketConversations) // include conversations
            .OrderByDescending(x => x.TicketConversations
                .OrderByDescending(c => c.CreatedDate)
                .Select(c => c.CreatedDate)
                .FirstOrDefault()) // latest conversation
            .ThenByDescending(x => x.CreatedDate)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);


        var mapData = _mapper.Map<List<GetSupportTicketDto>>(supportTickets);

        return Result<List<GetSupportTicketDto>>.Success(mapData, "Tickets are....");
    }
}
