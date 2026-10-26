using Application.Dto.PosItems;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.PosItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.PosItems.Queries;

public class GetPosItemByIdQuery : IRequest<Result<GetPosItemDto>>
{
    public int Id { get; set; }

    public GetPosItemByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetPosItemByIdQueryHandler : IRequestHandler<GetPosItemByIdQuery, Result<GetPosItemDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetPosItemByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetPosItemDto>> Handle(GetPosItemByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<PosItem>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetPosItemDto>.BadRequest("PosItem does not exist.");

        return Result<GetPosItemDto>.Success(_mapper.Map<GetPosItemDto>(entity), "PosItem retrieved successfully.");
    }
}
