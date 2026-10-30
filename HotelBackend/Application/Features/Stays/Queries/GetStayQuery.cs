using Application.Dto.Stays;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Stays.Queries;

public class GetAllStayQuery : IRequest<PaginatedResult<GetStayDto>>
{
    public string? Search { get; set; }
    public StayStatus? Status { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllStayQueryHandler : IRequestHandler<GetAllStayQuery, PaginatedResult<GetStayDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllStayQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetStayDto>> Handle(GetAllStayQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<Stay>().Entities
            .Include(x => x.Companions)
            .Include(x => x.Charges)
            .Include(x => x.StayRooms)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.StayNo.ToLower().Contains(search) || x.GuestName.ToLower().Contains(search) || x.GuestPhone.Contains(search) || x.RoomNumber.ToLower().Contains(search));
        }

        if (request.Status != null)
            query = query.Where(x => x.Status == request.Status);

        query = query.OrderByDescending(x => x.CheckInAt);
        return await ListQuery.ToPagedResultAsync<Stay, GetStayDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}

public class GetStayByIdQuery : IRequest<Result<GetStayDto>>
{
    public int Id { get; set; }

    public GetStayByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetStayByIdQueryHandler : IRequestHandler<GetStayByIdQuery, Result<GetStayDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetStayByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetStayDto>> Handle(GetStayByIdQuery request, CancellationToken cancellationToken)
    {
        var stay = await _queryContext.Repository<Stay>().Entities
            .Include(x => x.Companions)
            .Include(x => x.Charges)
            .Include(x => x.StayRooms)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (stay == null)
            return Result<GetStayDto>.BadRequest("Stay does not exist.");

        return Result<GetStayDto>.Success(_mapper.Map<GetStayDto>(stay), "Stay retrieved successfully.");
    }
}
