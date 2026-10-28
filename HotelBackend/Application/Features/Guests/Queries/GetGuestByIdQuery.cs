using Application.Dto.Guests;
using Application.Dto.Stays;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Guests;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Guests.Queries;

public class GetGuestByIdQuery : IRequest<Result<GetGuestDto>>
{
    public int Id { get; set; }

    public GetGuestByIdQuery(int id)
    {
        Id = id;
    }
}

internal class GetGuestByIdQueryHandler : IRequestHandler<GetGuestByIdQuery, Result<GetGuestDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetGuestByIdQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<Result<GetGuestDto>> Handle(GetGuestByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _queryContext.Repository<Guest>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<GetGuestDto>.BadRequest("Guest does not exist.");

        var dto = _mapper.Map<GetGuestDto>(entity);

        var stays = await _queryContext.Repository<Stay>().Entities
            .Include(x => x.Room)
            .Include(x => x.RatePlan)
            .Include(x => x.Companions)
            .Include(x => x.Charges)
            .Where(x => x.GuestId == request.Id)
            .OrderByDescending(x => x.CheckInAt)
            .ToListAsync(cancellationToken);

        dto.Stays = _mapper.Map<List<GetStayDto>>(stays);

        return Result<GetGuestDto>.Success(dto, "Guest retrieved successfully.");
    }
}
