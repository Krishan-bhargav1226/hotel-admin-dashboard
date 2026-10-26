using Application.Dto.Guests;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Guests;
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
        return await ListQuery.ToPagedResultAsync<Guest, GetGuestDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
