using Application.Dto.RatePlans;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.RatePlans;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.RatePlans.Queries;

public class GetRatePlanByIdQuery : IRequest<Result<GetRatePlanDto>>
{
    public int Id { get; set; }

    public GetRatePlanByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetRatePlanByIdQueryHandler : IRequestHandler<GetRatePlanByIdQuery, Result<GetRatePlanDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetRatePlanByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetRatePlanDto>> Handle(GetRatePlanByIdQuery request, CancellationToken cancellationToken)
    {
        var plan = await _queryContext.Repository<RatePlan>().Entities
            .Include(x => x.Rooms)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (plan == null)
            return Result<GetRatePlanDto>.BadRequest("Rate plan does not exist.");

        return Result<GetRatePlanDto>.Success(_mapper.Map<GetRatePlanDto>(plan), "Rate plan retrieved successfully.");
    }
}
