using Application.Dto.LostItems;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.LostItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Common.Enums.Hotels;

namespace Application.Features.LostItems.Queries;

public class GetAllLostItemQuery : IRequest<PaginatedResult<GetLostItemDto>>
{
    public string? Search { get; set; }
    public LostItemStatus? Status { get; set; }
    public LostItemCategory? Category { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllLostItemQueryHandler : IRequestHandler<GetAllLostItemQuery, PaginatedResult<GetLostItemDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllLostItemQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetLostItemDto>> Handle(GetAllLostItemQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<LostItem>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Title.ToLower().Contains(search) || (x.GuestName != null && x.GuestName.ToLower().Contains(search)) || (x.RoomNumber != null && x.RoomNumber.ToLower().Contains(search)));
        }

        if (request.Status != null)
            query = query.Where(x => x.Status == request.Status);
        if (request.Category != null)
            query = query.Where(x => x.Category == request.Category);
        query = query.OrderByDescending(x => x.CreatedDate);
        return await ListQuery.ToPagedResultAsync<LostItem, GetLostItemDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
