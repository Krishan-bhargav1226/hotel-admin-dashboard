using Application.Dto.Properties;
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

    public GetPropertyByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetPropertyDto>> Handle(GetPropertyByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<HotelProperty>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetPropertyDto>.BadRequest("Property does not exist.");

        return Result<GetPropertyDto>.Success(_mapper.Map<GetPropertyDto>(entity), "Property retrieved successfully.");
    }
}
