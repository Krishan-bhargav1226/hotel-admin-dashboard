using Application.Dto.LostItems;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.LostItems;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.LostItems.Queries;

public class GetLostItemByIdQuery : IRequest<Result<GetLostItemDto>>
{
    public int Id { get; set; }

    public GetLostItemByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetLostItemByIdQueryHandler : IRequestHandler<GetLostItemByIdQuery, Result<GetLostItemDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetLostItemByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetLostItemDto>> Handle(GetLostItemByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<LostItem>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetLostItemDto>.BadRequest("LostItem does not exist.");

        return Result<GetLostItemDto>.Success(_mapper.Map<GetLostItemDto>(entity), "LostItem retrieved successfully.");
    }
}
