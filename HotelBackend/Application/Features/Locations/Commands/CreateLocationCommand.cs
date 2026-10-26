using Application.Common.Exceptions;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Locations;
using AutoMapper;
using Domain.Entities.Locations;
using Domain.Entities.Locations.LocationTypes;
using MediatR;
using Shared;

namespace Application.Features.Locations.Commands;

public class CreateLocationCommand : IRequest<Result<int>>
{
    public string? Name { get; set; }
    public int? LocationType { get; set; }
    public string? Code { get; set; }
    public string? ShortName { get; set; }
    public int? ParentId { get; set; }
}

internal class CreateLocationCommandHandler : IRequestHandler<CreateLocationCommand, Result<int>>
{
    private readonly ILocationRepository _location;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;

    public CreateLocationCommandHandler(ILocationRepository location, IMapper mapper, ValidationManager validationManager)
    {
        _location = location;
        _mapper = mapper;
        _validationManager = validationManager;
    }

    public async Task<Result<int>> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        await ValidateInput(request);

        var location = _mapper.Map<Location>(request);

        var createdLocationId = await _location.CreateLocation(location);

        return Result<int>.Success(createdLocationId, "Location created successfully");
    }

    private async Task ValidateInput(CreateLocationCommand request)
    {
        _validationManager.ValidateEnum<LocationType>(request.LocationType);

        //if (request.ParentId != null)
        //{
        //    bool checkParent = await _location.CheckLocationId(request.ParentId.Value);

        //    if (!checkParent)
        //    {
        //        throw new BadRequestException("Parent doesn't exists");
        //    }
        //}
    }
}
