using Application.Dto.Reservations;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Reservations;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Reservations.Queries;

public class GetAllReservationQuery : IRequest<PaginatedResult<GetReservationDto>>
{
    public string? Search { get; set; }
    public ReservationStatus? Status { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllReservationQueryHandler : IRequestHandler<GetAllReservationQuery, PaginatedResult<GetReservationDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllReservationQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetReservationDto>> Handle(GetAllReservationQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<Reservation>().Entities.AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.BookingNo.ToLower().Contains(search) || x.GuestName.ToLower().Contains(search) || x.GuestPhone.Contains(search));
        }

        if (request.Status != null)
            query = query.Where(x => x.Status == request.Status);
        if (request.FromDate != null)
            query = query.Where(x => x.CheckOutDate >= request.FromDate);
        if (request.ToDate != null)
            query = query.Where(x => x.CheckInDate <= request.ToDate);

        query = query.OrderBy(x => x.CheckInDate);
        return await ListQuery.ToPagedResultAsync<Reservation, GetReservationDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}

public class GetReservationByIdQuery : IRequest<Result<GetReservationDto>>
{
    public int Id { get; set; }

    public GetReservationByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetReservationByIdQueryHandler : IRequestHandler<GetReservationByIdQuery, Result<GetReservationDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetReservationByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetReservationDto>> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var reservation = await _queryContext.Repository<Reservation>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (reservation == null)
            return Result<GetReservationDto>.BadRequest("Reservation does not exist.");

        return Result<GetReservationDto>.Success(_mapper.Map<GetReservationDto>(reservation), "Reservation retrieved successfully.");
    }
}
