using Application.Features.Locations.Commands;
using Application.Features.Locations.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Locations;

[Route("api/location")]
[ApiController]
public class LocationController : ControllerBase
{
    private readonly IMediator _mediator;

    public LocationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> CreateLocation(CreateLocationCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateLocation(int id, CreateLocationCommand command)
    {
        var data = await _mediator.Send(new UpdateLocationCommand(command, id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteLocation(int id)
    {
        var data = await _mediator.Send(new DeleteLocationCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult> GetLocationById(int id)
    {
        var data = await _mediator.Send(new GetByIdLocationQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult> GetAllLocation(int? locationTypeId,int? parentId)
    {
        var data = await _mediator.Send(new GetAllLocationQuery(locationTypeId,parentId));
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [HttpGet("type")]
    public async Task<ActionResult> GetLocationTypeLookup()
    {
        var data = await _mediator.Send(new GetLocationTypeLookupQuery());
        return ResponseHelper.GenerateResponse(data);
    }
}
