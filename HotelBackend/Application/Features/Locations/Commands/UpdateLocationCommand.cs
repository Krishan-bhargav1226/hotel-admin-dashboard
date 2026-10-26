using Application.Common.Exceptions;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Locations;
using AutoMapper;
using Domain.Entities.Locations.LocationTypes;
using MediatR;
using Shared;

namespace Application.Features.Locations.Commands;

public class UpdateLocationCommand : IRequest<Result<string>>
{
    public CreateLocationCommand Location { get; set; }
    public int Id { get; set; }

    public UpdateLocationCommand(CreateLocationCommand location, int id)
    {
        Location = location;
        Id = id;
    }
}

internal class UpdateLocationCommandHandler : IRequestHandler<UpdateLocationCommand, Result<string>>
{
    private readonly ILocationRepository _location;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;

    public UpdateLocationCommandHandler(ILocationRepository location, IMapper mapper, ValidationManager validationManager)
    {
        _location = location;
        _mapper = mapper;
        _validationManager = validationManager;
    }

    public async Task<Result<string>> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        await ValidateInput(request.Location);

        var location = await _location.GetLocationById(request.Id);

        if (location == null)
        {
            return Result<string>.BadRequest("Location doesn't exists");
        }

        _mapper.Map(request.Location, location);

        await _location.UpdateLocation(location);

        return Result<string>.Success("Location updated successfully");
    }

    private async Task ValidateInput(CreateLocationCommand request)
    {
        _validationManager.ValidateEnum<LocationType>(request.LocationType);

        if (request.ParentId != null)
        {
            bool checkParent = await _location.CheckLocationId(request.ParentId.Value);

            if (!checkParent)
            {
                throw new BadRequestException("Parent doesn't exists");
            }
        }
    }
}
