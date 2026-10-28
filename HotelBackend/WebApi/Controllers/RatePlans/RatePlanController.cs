using Application.Features.RatePlans.Commands;
using Application.Features.RatePlans.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.RatePlans;

[Route("api/rate/plan")]
[ApiController]
public class RatePlanController : ControllerBase
{
    private readonly IMediator _mediator;

    public RatePlanController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateRatePlanCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, CreateRatePlanCommand command)
    {
        var data = await _mediator.Send(new UpdateRatePlanCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeleteRatePlanCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetRatePlanByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> GetAll([FromQuery] GetAllRatePlanQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }
}
