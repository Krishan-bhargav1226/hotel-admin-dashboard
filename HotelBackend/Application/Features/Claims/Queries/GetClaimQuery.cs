using Application.Dto.Claims;
using Application.Interfaces.Repositories.Claims;
using AutoMapper;
using MediatR;
using Shared;

namespace Application.Features.Claims.Queries;

public class GetClaimQuery : IRequest<Result<List<GetClaimDto>>>
{
}
internal class GetClaimQueryHandler : IRequestHandler<GetClaimQuery, Result<List<GetClaimDto>>>
{
    private readonly IClaimRepository _repositoary;
    private readonly IMapper _mapper;

    public GetClaimQueryHandler(IClaimRepository repositoary, IMapper mapper)
    {
        _repositoary = repositoary;
        _mapper = mapper;
    }

    public async Task<Result<List<GetClaimDto>>> Handle(GetClaimQuery request, CancellationToken cancellationToken)
    {
        var getAllClaim = await _repositoary.GetAll();
        var mapClaim = getAllClaim.Select(claim => new GetClaimDto
        {
            Id = claim.Id,
            UserId = Guid.TryParse(claim.UserId, out var id) ? id : Guid.Empty, // Handle Id conversion
            ClaimType = claim.ClaimType,
            ClaimValue = claim.ClaimValue
        }).ToList();
        if (getAllClaim != null)
        {
            return Result<List<GetClaimDto>>.Success(mapClaim, "Claim List");
        }
        return Result<List<GetClaimDto>>.NotFound("Data not found");
    }
}
