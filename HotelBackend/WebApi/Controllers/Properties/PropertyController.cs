using Application.Features.Properties.Commands;
using Application.Features.Properties.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Properties;

[Route("api/property")]
[ApiController]
public class PropertyController : ControllerBase
{
    private readonly IMediator _mediator;

    public PropertyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreatePropertyCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, CreatePropertyCommand command)
    {
        var data = await _mediator.Send(new UpdatePropertyCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeletePropertyCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetPropertyByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> GetAll([FromQuery] GetAllPropertyQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }

}
