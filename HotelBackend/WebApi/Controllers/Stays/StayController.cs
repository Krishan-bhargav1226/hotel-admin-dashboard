using Application.Features.Stays.Commands;
using Application.Features.Stays.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Stays;

[Route("api/stay")]
[ApiController]
public class StayController : ControllerBase
{
    private readonly IMediator _mediator;

    public StayController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("check-in")]
    public async Task<ActionResult> CheckIn(CheckInCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPost("{id:int}/check-out")]
    public async Task<ActionResult> CheckOut(int id, CheckOutCommand command)
    {
        command.Id = id;
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateStayCommand command)
    {
        command.Id = id;
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPost("{id:int}/payment")]
    public async Task<ActionResult> CollectPayment(int id, CollectStayPaymentCommand command)
    {
        command.Id = id;
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeleteStayCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetStayByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> GetAll([FromQuery] GetAllStayQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }
}
