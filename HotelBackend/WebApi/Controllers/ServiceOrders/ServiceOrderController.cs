using Application.Features.ServiceOrders.Commands;
using Application.Features.ServiceOrders.Queries;
using Domain.Entities.Hotels;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.ServiceOrders;

[Route("api/pos/order")]
[ApiController]
public class ServiceOrderController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServiceOrderController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateServiceOrderCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest body)
    {
        var data = await _mediator.Send(new UpdateServiceOrderStatusCommand(id, body.Status));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeleteServiceOrderCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> GetAll([FromQuery] GetAllServiceOrdersQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }
}

public class UpdateStatusRequest
{
    public ServiceOrderStatus Status { get; set; }
}
