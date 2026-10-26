using Application.Dto.Rooms;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Entities.Hotels;

namespace Application.Features.Rooms.Queries;

public class GetAllRoomQuery : IRequest<PaginatedResult<GetRoomDto>>
{
    public string? Search { get; set; }
    public int? PropertyId { get; set; }
    public int? RoomTypeId { get; set; }
    public RoomStatus? Status { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllRoomQueryHandler : IRequestHandler<GetAllRoomQuery, PaginatedResult<GetRoomDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllRoomQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetRoomDto>> Handle(GetAllRoomQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<Room>().Entities.Include(x => x.RoomType).Include(x => x.Property).AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Number.ToLower().Contains(search) || (x.Floor != null && x.Floor.ToLower().Contains(search)) || (x.Notes != null && x.Notes.ToLower().Contains(search)));
        }

        if (request.PropertyId != null)
            query = query.Where(x => x.PropertyId == request.PropertyId);
        if (request.RoomTypeId != null)
            query = query.Where(x => x.RoomTypeId == request.RoomTypeId);
        if (request.Status != null)
            query = query.Where(x => x.Status == request.Status);
        query = query.OrderBy(x => x.Number);
        return await ListQuery.ToPagedResultAsync<Room, GetRoomDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
