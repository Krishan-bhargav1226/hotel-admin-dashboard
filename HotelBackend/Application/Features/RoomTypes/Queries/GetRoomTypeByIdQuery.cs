using Application.Dto.RoomTypes;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.RoomTypes.Queries;

public class GetRoomTypeByIdQuery : IRequest<Result<GetRoomTypeDto>>
{
    public int Id { get; set; }

    public GetRoomTypeByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetRoomTypeByIdQueryHandler : IRequestHandler<GetRoomTypeByIdQuery, Result<GetRoomTypeDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetRoomTypeByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetRoomTypeDto>> Handle(GetRoomTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<RoomType>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetRoomTypeDto>.BadRequest("RoomType does not exist.");

        return Result<GetRoomTypeDto>.Success(_mapper.Map<GetRoomTypeDto>(entity), "RoomType retrieved successfully.");
    }
}
