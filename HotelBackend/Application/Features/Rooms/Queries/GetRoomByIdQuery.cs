using Application.Dto.Rooms;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Rooms.Queries;

public class GetRoomByIdQuery : IRequest<Result<GetRoomDto>>
{
    public int Id { get; set; }

    public GetRoomByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetRoomByIdQueryHandler : IRequestHandler<GetRoomByIdQuery, Result<GetRoomDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetRoomByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetRoomDto>> Handle(GetRoomByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<Room>().Entities.Include(x => x.RoomType).Include(x => x.Property)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetRoomDto>.BadRequest("Room does not exist.");

        return Result<GetRoomDto>.Success(_mapper.Map<GetRoomDto>(entity), "Room retrieved successfully.");
    }
}
