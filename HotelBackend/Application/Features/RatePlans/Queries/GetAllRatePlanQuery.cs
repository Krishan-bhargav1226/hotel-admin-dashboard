using Application.Dto.RatePlans;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.RatePlans;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.RatePlans.Queries;

public class GetAllRatePlanQuery : IRequest<PaginatedResult<GetRatePlanDto>>
{
    public string? Search { get; set; }
    public PlanKind? Kind { get; set; }
    public bool? IsActive { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllRatePlanQueryHandler : IRequestHandler<GetAllRatePlanQuery, PaginatedResult<GetRatePlanDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllRatePlanQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetRatePlanDto>> Handle(GetAllRatePlanQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<RatePlan>().Entities.Include(x => x.Rooms).AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(search));
        }

        if (request.Kind != null)
            query = query.Where(x => x.Kind == request.Kind);
        if (request.IsActive != null)
            query = query.Where(x => x.IsActive == request.IsActive);

        query = query.OrderByDescending(x => x.CreatedDate);
        return await ListQuery.ToPagedResultAsync<RatePlan, GetRatePlanDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
