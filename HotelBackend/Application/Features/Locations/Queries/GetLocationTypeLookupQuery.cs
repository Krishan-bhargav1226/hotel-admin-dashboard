using Application.Dto.CommonDtos;
using AutoMapper;
using Domain.Entities.Locations.LocationTypes;
using MediatR;
using Shared;

namespace Application.Features.Locations.Queries;

public class GetLocationTypeLookupQuery : IRequest<Result<List<IdAndNameDto>>>;

internal class GetLocationTypeLookupQueryHandler : IRequestHandler<GetLocationTypeLookupQuery, Result<List<IdAndNameDto>>>
{
    private readonly IMapper _mapper;

    public GetLocationTypeLookupQueryHandler(IMapper mapper)
    {
        _mapper = mapper;
    }

    public async Task<Result<List<IdAndNameDto>>> Handle(GetLocationTypeLookupQuery request, CancellationToken cancellationToken)
    {
        var locationTypes = Enum.GetValues(typeof(LocationType))
            .Cast<LocationType>();

        var mapData = _mapper.Map<List<IdAndNameDto>>(locationTypes);

        return Result<List<IdAndNameDto>>.Success(mapData, "Location Types");
    }
}
