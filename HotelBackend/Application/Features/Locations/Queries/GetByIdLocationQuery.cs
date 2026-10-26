using Application.Dto.Locations;
using Application.Interfaces.Repositories.Locations;
using AutoMapper;
using MediatR;
using Shared;

namespace Application.Features.Locations.Queries;

public class GetByIdLocationQuery : IRequest<Result<GetLocationDto>>
{
    public int Id { get; set; }

    public GetByIdLocationQuery(int id)
    {
        Id = id;
    }
}

internal class GetByIdLocationQueryHandler : IRequestHandler<GetByIdLocationQuery, Result<GetLocationDto>>
{
    private readonly IMapper _mapper;
    private readonly ILocationRepository _location;

    public GetByIdLocationQueryHandler(ILocationRepository location, IMapper mapper)
    {
        _location = location;
        _mapper = mapper;
    }

    public async Task<Result<GetLocationDto>> Handle(GetByIdLocationQuery request, CancellationToken cancellationToken)
    {
        var location = await _location.GetLocationById(request.Id);

        if (location == null)
        {
            return Result<GetLocationDto>.BadRequest("Location doesn't exists");
        }

        var mapData = _mapper.Map<GetLocationDto>(location);

        return Result<GetLocationDto>.Success(mapData, "Location");
    }
}
