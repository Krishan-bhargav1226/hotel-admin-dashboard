

using Application.Dto.SupportTickets;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.SupportTickets;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Queries;

public class GetSupportTicketByIdQuery : IRequest<Result<GetSupportTicketDto>>
{
    public int Id { get; set; }

    public GetSupportTicketByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetSupportTicketByIdQueryHandler : IRequestHandler<GetSupportTicketByIdQuery, Result<GetSupportTicketDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetSupportTicketByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetSupportTicketDto>> Handle(GetSupportTicketByIdQuery request, CancellationToken cancellationToken)
    {

        var supportTicket = await _queryContext.Repository<SupportTicket>().Entities
            .Include(x => x.TicketType)
            //.Include(x=>x.AssignTo)
            .FirstOrDefaultAsync(x => x.Id == request.Id);

        if (supportTicket == null)
        {
            return Result<GetSupportTicketDto>.BadRequest("Ticket Id not exist...");
        }

        var mapData = _mapper.Map<GetSupportTicketDto>(supportTicket);

        return Result<GetSupportTicketDto>.Success(mapData, "Tickets are....");
    }
}

