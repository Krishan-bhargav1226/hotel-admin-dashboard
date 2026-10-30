using Application.Features.Housekeepings.Commands;
using Domain.Common.Enums.Hotels;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Housekeepings;

[Route("api/housekeeping")]
[ApiController]
public class HousekeepingController : ControllerBase
{
    private readonly IMediator _mediator;

    public HousekeepingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] GetAllHousekeepingQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, HousekeepingBody body)
    {
        var data = await _mediator.Send(new UpdateHousekeepingCommand(id, body.Status, body.Priority, body.AssignedTo, body.Notes));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("room/{roomId:int}")]
    public async Task<ActionResult> UpdateByRoom(int roomId, UpdateRoomHousekeepingCommand command)
    {
        command.RoomId = roomId;
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }
}

public class HousekeepingBody
{
    public HousekeepingStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public string? AssignedTo { get; set; }
    public string? Notes { get; set; }
}
