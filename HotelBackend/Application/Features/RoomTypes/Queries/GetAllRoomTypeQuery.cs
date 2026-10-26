using Application.Dto.RoomTypes;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Entities.Hotels;

namespace Application.Features.RoomTypes.Queries;

public class GetAllRoomTypeQuery : IRequest<PaginatedResult<GetRoomTypeDto>>
{
    public string? Search { get; set; }
    public RoomCategory? Category { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllRoomTypeQueryHandler : IRequestHandler<GetAllRoomTypeQuery, PaginatedResult<GetRoomTypeDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllRoomTypeQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetRoomTypeDto>> Handle(GetAllRoomTypeQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<RoomType>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(search) || (x.Description != null && x.Description.ToLower().Contains(search)));
        }

        if (request.Category != null)
            query = query.Where(x => x.Category == request.Category);
        query = query.OrderByDescending(x => x.CreatedDate);
        return await ListQuery.ToPagedResultAsync<RoomType, GetRoomTypeDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
