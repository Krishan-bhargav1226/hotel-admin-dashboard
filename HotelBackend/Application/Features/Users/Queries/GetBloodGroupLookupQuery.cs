using Application.Dto.CommonDtos;
using AutoMapper;
using Domain.Commons.Enums.Employees;
using MediatR;
using Shared;

namespace Application.Features.Users;

public class GetBloodGroupLookupQuery : IRequest<Result<List<IdAndNameDto>>>;

internal class GetBloodGroupLookupQueryHandler : IRequestHandler<GetBloodGroupLookupQuery, Result<List<IdAndNameDto>>>
{
    private readonly IMapper _mapper;

    public GetBloodGroupLookupQueryHandler(IMapper mapper)
    {
        _mapper = mapper;
    }

    public async Task<Result<List<IdAndNameDto>>> Handle(GetBloodGroupLookupQuery request, CancellationToken cancellationToken)
    {
        var bloodGroups = Enum.GetValues(typeof(BloodGroup))
                             .Cast<BloodGroup>().ToList();

        var mapData = _mapper.Map<List<IdAndNameDto>>(bloodGroups);

        return Result<List<IdAndNameDto>>.Success(mapData, "Blood Groups");
    }
}
