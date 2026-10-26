using Application.Dto.Guests;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Guests;
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

        return Result<GetGuestDto>.Success(_mapper.Map<GetGuestDto>(entity), "Guest retrieved successfully.");
    }
}
