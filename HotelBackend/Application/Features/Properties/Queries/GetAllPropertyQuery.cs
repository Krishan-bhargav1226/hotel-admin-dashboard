using Application.Dto.Properties;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Entities.Hotels;

namespace Application.Features.Properties.Queries;

public class GetAllPropertyQuery : IRequest<PaginatedResult<GetPropertyDto>>
{
    public string? Search { get; set; }
    public PropertyStatus? Status { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllPropertyQueryHandler : IRequestHandler<GetAllPropertyQuery, PaginatedResult<GetPropertyDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllPropertyQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetPropertyDto>> Handle(GetAllPropertyQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<HotelProperty>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(search) || (x.Location != null && x.Location.ToLower().Contains(search)) || (x.ManagerName != null && x.ManagerName.ToLower().Contains(search)));
        }

        if (request.Status != null)
            query = query.Where(x => x.Status == request.Status);
        query = query.OrderByDescending(x => x.CreatedDate);
        return await ListQuery.ToPagedResultAsync<HotelProperty, GetPropertyDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
