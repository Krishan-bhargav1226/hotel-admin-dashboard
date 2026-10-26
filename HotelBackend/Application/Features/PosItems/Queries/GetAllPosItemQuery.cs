using Application.Dto.PosItems;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.PosItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Entities.Hotels;

namespace Application.Features.PosItems.Queries;

public class GetAllPosItemQuery : IRequest<PaginatedResult<GetPosItemDto>>
{
    public string? Search { get; set; }
    public MenuCategory? Category { get; set; }
    public bool? IsAvailable { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllPosItemQueryHandler : IRequestHandler<GetAllPosItemQuery, PaginatedResult<GetPosItemDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllPosItemQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetPosItemDto>> Handle(GetAllPosItemQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<PosItem>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(search));
        }

        if (request.Category != null)
            query = query.Where(x => x.Category == request.Category);
        if (request.IsAvailable != null)
            query = query.Where(x => x.IsAvailable == request.IsAvailable);
        query = query.OrderByDescending(x => x.CreatedDate);
        return await ListQuery.ToPagedResultAsync<PosItem, GetPosItemDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
