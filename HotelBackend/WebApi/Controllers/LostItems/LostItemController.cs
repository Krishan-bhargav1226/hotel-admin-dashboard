using Application.Features.LostItems.Commands;
using Application.Features.LostItems.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.LostItems;

[Route("api/lost/item")]
[ApiController]
public class LostItemController : ControllerBase
{
    private readonly IMediator _mediator;

    public LostItemController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateLostItemCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, CreateLostItemCommand command)
    {
        var data = await _mediator.Send(new UpdateLostItemCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeleteLostItemCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetLostItemByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> GetAll([FromQuery] GetAllLostItemQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }

    [HttpPut("{id:int}/claim")]
    public async Task<ActionResult> Claim(int id, ClaimLostItemCommand command)
    {
        command.Id = id;
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

}
