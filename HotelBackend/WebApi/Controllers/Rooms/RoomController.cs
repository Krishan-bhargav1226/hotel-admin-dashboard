using Application.Features.Rooms.Commands;
using Application.Features.Rooms.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Rooms;

[Route("api/room")]
[ApiController]
public class RoomController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromForm] CreateRoomCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromForm] CreateRoomCommand command)
    {
        var data = await _mediator.Send(new UpdateRoomCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeleteRoomCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetRoomByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> GetAll([FromQuery] GetAllRoomQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult> CreateBulk(CreateBulkRoomCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult> UpdateStatus(int id, RoomStatusBody body)
    {
        var data = await _mediator.Send(new UpdateRoomStatusCommand(id, body.Status));
        return ResponseHelper.GenerateResponse(data);
    }

}
