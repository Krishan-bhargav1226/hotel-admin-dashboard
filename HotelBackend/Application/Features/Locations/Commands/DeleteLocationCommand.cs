using Application.Interfaces.Repositories.Locations;
using MediatR;
using Shared;

namespace Application.Features.Locations.Commands;

public class DeleteLocationCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteLocationCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteLocationCommandHandler : IRequestHandler<DeleteLocationCommand, Result<string>>
{
    private readonly ILocationRepository _location;

    public DeleteLocationCommandHandler(ILocationRepository location)
    {
        _location = location;
    }

    public async Task<Result<string>> Handle(DeleteLocationCommand request, CancellationToken cancellationToken)
    {
        var location = await _location.GetLocationById(request.Id);

        if (location == null)
        {
            return Result<string>.BadRequest("Location doesn't exists");
        }

        await _location.DeleteLocation(location);

        return Result<string>.Success("Location deleted successfully");
    }
}
