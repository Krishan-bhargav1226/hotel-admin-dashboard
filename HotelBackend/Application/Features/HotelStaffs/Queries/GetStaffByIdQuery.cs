using Application.Dto.HotelStaffs;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.HotelStaffs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.HotelStaffs.Queries;

public class GetStaffByIdQuery : IRequest<Result<GetStaffDto>>
{
    public int Id { get; set; }

    public GetStaffByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetStaffByIdQueryHandler : IRequestHandler<GetStaffByIdQuery, Result<GetStaffDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetStaffByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetStaffDto>> Handle(GetStaffByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<HotelStaff>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetStaffDto>.BadRequest("Staff does not exist.");

        return Result<GetStaffDto>.Success(_mapper.Map<GetStaffDto>(entity), "Staff retrieved successfully.");
    }
}
