using Application.Dto.Shifts;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Shifts;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Common.Enums.Hotels;

namespace Application.Features.Shifts.Queries;

public class GetAllShiftQuery : IRequest<PaginatedResult<GetShiftDto>>
{
    public string? Search { get; set; }
    public ShiftType? ShiftType { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllShiftQueryHandler : IRequestHandler<GetAllShiftQuery, PaginatedResult<GetShiftDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllShiftQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetShiftDto>> Handle(GetAllShiftQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<ShiftRegister>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.StaffName.ToLower().Contains(search));
        }

        if (request.ShiftType != null)
            query = query.Where(x => x.ShiftType == request.ShiftType);
        query = query.OrderByDescending(x => x.ShiftDate);
        return await ListQuery.ToPagedResultAsync<ShiftRegister, GetShiftDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
