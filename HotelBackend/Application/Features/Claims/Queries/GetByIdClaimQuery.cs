using Application.Dto.Claims;
using Application.Interfaces.Repositories.Claims;
using AutoMapper;
using MediatR;
using Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Claims.Queries;

public class GetByIdClaimQuery:IRequest<Result<GetClaimDto>>
{
    public int Id { get; set; }

    public GetByIdClaimQuery(int id)
    {
        Id = id;
    }
}
internal class GetByIdClaimQueryHandler : IRequestHandler<GetByIdClaimQuery, Result<GetClaimDto>>
{
    private readonly IClaimRepository _repository;
    private readonly IMapper _mapper;

    public GetByIdClaimQueryHandler(IClaimRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Result<GetClaimDto>> Handle(GetByIdClaimQuery request, CancellationToken cancellationToken)
    {
       var getByIdClaim=await _repository.GetById(request.Id);
        var mapClaim = _mapper.Map<GetClaimDto>(getByIdClaim);
        if(getByIdClaim==null)
        {
            return Result<GetClaimDto>.NotFound("Id not found");
        }
        return Result<GetClaimDto>.Success(mapClaim, "Claim List");
    }
}
