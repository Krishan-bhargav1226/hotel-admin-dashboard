using Application.Dto.Shifts;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Shifts;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Shifts.Queries;

public class GetShiftByIdQuery : IRequest<Result<GetShiftDto>>
{
    public int Id { get; set; }

    public GetShiftByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetShiftByIdQueryHandler : IRequestHandler<GetShiftByIdQuery, Result<GetShiftDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetShiftByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetShiftDto>> Handle(GetShiftByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<ShiftRegister>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetShiftDto>.BadRequest("Shift does not exist.");

        return Result<GetShiftDto>.Success(_mapper.Map<GetShiftDto>(entity), "Shift retrieved successfully.");
    }
}
