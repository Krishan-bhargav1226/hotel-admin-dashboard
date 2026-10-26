using Application.Dto.CommonDtos;
using AutoMapper;
using Domain.Commons.Enums.Users;
using MediatR;
using Shared;

namespace Application.Features.Users;

public class GetGenderLookupQuery : IRequest<Result<List<IdAndNameDto>>>;

internal class GetGenderLookupQueryHandler : IRequestHandler<GetGenderLookupQuery, Result<List<IdAndNameDto>>>
{
    private readonly IMapper _mapper;

    public GetGenderLookupQueryHandler(IMapper mapper)
    {
        _mapper = mapper;
    }

    public async Task<Result<List<IdAndNameDto>>> Handle(GetGenderLookupQuery request, CancellationToken cancellationToken)
    {
        var genders = Enum.GetValues(typeof(Gender))
                             .Cast<Gender>().ToList();

        var mapData = _mapper.Map<List<IdAndNameDto>>(genders);

        return Result<List<IdAndNameDto>>.Success(mapData, "Genders");
    }
}
