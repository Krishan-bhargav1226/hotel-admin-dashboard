using Application.Features.PosItems.Commands;
using Application.Features.PosItems.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.PosItems;

[Route("api/pos/item")]
[ApiController]
public class PosItemController : ControllerBase
{
    private readonly IMediator _mediator;

    public PosItemController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreatePosItemCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, CreatePosItemCommand command)
    {
        var data = await _mediator.Send(new UpdatePosItemCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeletePosItemCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetPosItemByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] GetAllPosItemQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }

}
