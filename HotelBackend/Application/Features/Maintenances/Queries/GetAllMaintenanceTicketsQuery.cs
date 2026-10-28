using Application.Dto.Maintenances;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Maintenances;
using Domain.Entities.Hotels;
using MediatR;
using Shared;

namespace Application.Features.Maintenances.Queries;

public class GetAllMaintenanceTicketsQuery : IRequest<PaginatedResult<GetMaintenanceTicketDto>>
{
    public string? Search { get; set; }
    public int? RoomId { get; set; }
    public MaintenanceStatus? Status { get; set; }
    public MaintenancePriority? Priority { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllMaintenanceTicketsQueryHandler : IRequestHandler<GetAllMaintenanceTicketsQuery, PaginatedResult<GetMaintenanceTicketDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllMaintenanceTicketsQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetMaintenanceTicketDto>> Handle(GetAllMaintenanceTicketsQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<MaintenanceTicket>().Entities.AsQueryable();

        if (request.RoomId.HasValue)
            query = query.Where(x => x.RoomId == request.RoomId.Value);

        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);

        if (request.Priority.HasValue)
            query = query.Where(x => x.Priority == request.Priority.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(search) ||
                                     x.TicketNo.ToLower().Contains(search) ||
                                     x.RoomNumber.ToLower().Contains(search) ||
                                     (x.ReportedBy != null && x.ReportedBy.ToLower().Contains(search)) ||
                                     (x.AssignedTo != null && x.AssignedTo.ToLower().Contains(search)));
        }

        query = query.OrderByDescending(x => x.CreatedDate);

        return await ListQuery.ToPagedResultAsync<MaintenanceTicket, GetMaintenanceTicketDto>(
            query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
