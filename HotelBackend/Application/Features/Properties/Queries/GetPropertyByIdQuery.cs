using Application.Dto.Properties;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Properties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Properties.Queries;

public class GetPropertyByIdQuery : IRequest<Result<GetPropertyDto>>
{
    public int Id { get; set; }

    public GetPropertyByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetPropertyByIdQueryHandler : IRequestHandler<GetPropertyByIdQuery, Result<GetPropertyDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _caller;

    public GetPropertyByIdQueryHandler(IQueryContext queryContext, IMapper mapper, IUserIdAndOrganizationIdRepository caller)
    {
        _queryContext = queryContext;
        _mapper = mapper;
        _caller = caller;
    }

    public async Task<Result<GetPropertyDto>> Handle(GetPropertyByIdQuery request, CancellationToken cancellationToken)
    {
        var current = await _caller.Get();
        if (!current.IsSuperAdmin && current.PropertyId != request.Id)
            return Result<GetPropertyDto>.BadRequest("Property does not exist.");

        var entity = await _queryContext.Repository<HotelProperty>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetPropertyDto>.BadRequest("Property does not exist.");

        var dto = _mapper.Map<GetPropertyDto>(entity);
        await PropertyLiveStats.ApplyAsync(_queryContext, [dto], cancellationToken);
        return Result<GetPropertyDto>.Success(dto, "Property retrieved successfully.");
    }
}
