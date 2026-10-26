using Application.Dto.Locations;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Locations;
using AutoMapper;
using Domain.Entities.Locations.LocationTypes;
using MediatR;
using Shared;

namespace Application.Features.Locations.Queries;

public class GetAllLocationQuery : IRequest<Result<List<GetLocationDto>>>
{
    public int? LocationTypeId { get; set; }
    public int? ParentId { get; set; }

    public GetAllLocationQuery(int? locationTypeId, int? parentId)
    {
        LocationTypeId = locationTypeId;
        ParentId = parentId;
    }
}

internal class GetAllLocationQueryHandler : IRequestHandler<GetAllLocationQuery, Result<List<GetLocationDto>>>
{
    private readonly IMapper _mapper;
    private readonly ILocationRepository _location;
    private readonly ValidationManager _validationManager;

    public GetAllLocationQueryHandler(IMapper mapper, ILocationRepository location, ValidationManager validationManager)
    {
        _mapper = mapper;
        _location = location;
        _validationManager = validationManager;
    }

    public async Task<Result<List<GetLocationDto>>> Handle(GetAllLocationQuery request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<LocationType>(request.LocationTypeId);

        var locations = await _location.GetAllLocations(request.LocationTypeId,request.ParentId);

        var mapData = _mapper.Map<List<GetLocationDto>>(locations);

        return Result<List<GetLocationDto>>.Success(mapData, "Locations");
    }
}
