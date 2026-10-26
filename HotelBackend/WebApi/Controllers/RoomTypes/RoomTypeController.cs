using Application.Features.RoomTypes.Commands;
using Application.Features.RoomTypes.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.RoomTypes;

[Route("api/room/type")]
[ApiController]
public class RoomTypeController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomTypeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromForm] CreateRoomTypeCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromForm] CreateRoomTypeCommand command)
    {
        var data = await _mediator.Send(new UpdateRoomTypeCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeleteRoomTypeCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetRoomTypeByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] GetAllRoomTypeQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }

}
