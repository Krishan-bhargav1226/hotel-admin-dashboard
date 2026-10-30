using Application.Dto.HotelStaffs;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.HotelStaffs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using Domain.Common.Enums.Hotels;

namespace Application.Features.HotelStaffs.Queries;

public class GetAllStaffQuery : IRequest<PaginatedResult<GetStaffDto>>
{
    public string? Search { get; set; }
    public StaffRole? Role { get; set; }
    public int? PropertyId { get; set; }
    public DutyStatus? DutyStatus { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllStaffQueryHandler : IRequestHandler<GetAllStaffQuery, PaginatedResult<GetStaffDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllStaffQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetStaffDto>> Handle(GetAllStaffQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<HotelStaff>().Entities.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(search) || x.Phone.ToLower().Contains(search) || (x.Email != null && x.Email.ToLower().Contains(search)));
        }

        if (request.Role != null)
            query = query.Where(x => x.Role == request.Role);
        if (request.PropertyId != null)
            query = query.Where(x => x.PropertyId == request.PropertyId);
        if (request.DutyStatus != null)
            query = query.Where(x => x.DutyStatus == request.DutyStatus);
        query = query.OrderByDescending(x => x.CreatedDate);
        return await ListQuery.ToPagedResultAsync<HotelStaff, GetStaffDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
