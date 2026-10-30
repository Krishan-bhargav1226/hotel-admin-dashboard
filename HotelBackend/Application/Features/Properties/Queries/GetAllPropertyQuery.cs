using Application.Dto.Properties;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Common.Enums.Hotels;

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
    private readonly IUserIdAndOrganizationIdRepository _caller;

    public GetAllPropertyQueryHandler(IQueryContext queryContext, IMapper mapper, IUserIdAndOrganizationIdRepository caller)
    {
        _queryContext = queryContext;
        _mapper = mapper;
        _caller = caller;
    }

    public async Task<PaginatedResult<GetPropertyDto>> Handle(GetAllPropertyQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<HotelProperty>().Entities.AsQueryable();
        var current = await _caller.Get();
        if (!current.IsSuperAdmin && !current.IsAdmin)
        {
            if (current.PropertyId != null)
                query = query.Where(x => x.Id == current.PropertyId);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(search) || (x.Location != null && x.Location.ToLower().Contains(search)) || (x.ManagerName != null && x.ManagerName.ToLower().Contains(search)));
        }

        if (request.Status != null)
            query = query.Where(x => x.Status == request.Status);
        query = query.OrderByDescending(x => x.CreatedDate);
        var paged = await ListQuery.ToPagedResultAsync<HotelProperty, GetPropertyDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
        var rows = paged.Data.ToList();
        await PropertyLiveStats.ApplyAsync(_queryContext, rows, cancellationToken);
        return PaginatedResult<GetPropertyDto>.Create(rows, paged.TotalCount, paged.CurrentPage, paged.PageSize);
    }
}
