using Application.Dto.Guests;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Guests;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;


namespace Application.Features.Guests.Queries;

public class GetAllGuestQuery : IRequest<PaginatedResult<GetGuestDto>>
{
    public string? Search { get; set; }
    public bool? IsFlagged { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllGuestQueryHandler : IRequestHandler<GetAllGuestQuery, PaginatedResult<GetGuestDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllGuestQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetGuestDto>> Handle(GetAllGuestQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<Guest>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(search) || x.Phone.ToLower().Contains(search) || (x.IdNumber != null && x.IdNumber.ToLower().Contains(search)));
        }

        if (request.IsFlagged != null)
            query = query.Where(x => x.IsFlagged == request.IsFlagged);
        query = query.OrderByDescending(x => x.CreatedDate);
        var paged = await ListQuery.ToPagedResultAsync<Guest, GetGuestDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
        var ids = paged.Data.Select(x => x.Id).ToList();
        if (ids.Count == 0)
            return paged;

        var stays = await _queryContext.Repository<Stay>().Entities
            .Where(s => ids.Contains(s.GuestId))
            .Select(s => new { s.GuestId, s.TotalAmount, s.Status, s.CheckInAt, s.CheckOutAt })
            .ToListAsync(cancellationToken);

        var grouped = stays.GroupBy(s => s.GuestId).ToDictionary(g => g.Key, g => g.ToList());
        foreach (var guest in paged.Data)
        {
            if (!grouped.TryGetValue(guest.Id, out var rows))
                continue;
            guest.Visits = rows.Count;
            guest.TotalSpent = rows.Where(s => s.Status == StayStatus.COMPLETED).Sum(s => s.TotalAmount);
            guest.LastVisitAt = rows.Max(s => s.CheckOutAt ?? s.CheckInAt);
        }

        return paged;
    }
}
