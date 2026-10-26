

using Application.Dto.SupportTickets;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.SupportTickets;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Queries;

public class GetSupportTicketByUserIdQuery : IRequest<Result<List<GetSupportTicketDto>>>
{
    public string UserId { get; set; }

    public GetSupportTicketByUserIdQuery(string userId)
    {
        UserId = userId;
    }
}

internal class GetSupportTicketByUserIdQueryHandler : IRequestHandler<GetSupportTicketByUserIdQuery, Result<List<GetSupportTicketDto>>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userOrganization;

    public GetSupportTicketByUserIdQueryHandler(IQueryContext queryContext, IMapper mapper, IUserIdAndOrganizationIdRepository userOrganization)
    {
        _queryContext = queryContext;
        _mapper = mapper;
        _userOrganization = userOrganization;
    }

    public async Task<Result<List<GetSupportTicketDto>>> Handle(GetSupportTicketByUserIdQuery request, CancellationToken cancellationToken)
    {
        var useOrga = await _userOrganization.Get();


        if ((!useOrga.IsAdmin && useOrga.UserId != request.UserId) || useOrga.UserId == null || useOrga.UserId == "")
        {
            return Result<List<GetSupportTicketDto>>.BadRequest("Permission denied!");
        }

        var supportTicket = await _queryContext.Repository<SupportTicket>().Entities
                       .Where(x => x.RequestById == request.UserId)
                       .Include(x => x.TicketType)
                       //.Include(x => x.Department)
                       .ToListAsync(cancellationToken);

        if (supportTicket == null)
        {
            return Result<List<GetSupportTicketDto>>.BadRequest("Ticket Id not exist...");
        }

        var mapData = _mapper.Map<List<GetSupportTicketDto>>(supportTicket);

        return Result<List<GetSupportTicketDto>>.Success(mapData, "Tickets are....");
    }
}

