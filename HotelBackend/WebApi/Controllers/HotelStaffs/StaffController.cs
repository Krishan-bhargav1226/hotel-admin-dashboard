using Application.Features.HotelStaffs.Commands;
using Application.Features.HotelStaffs.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.HotelStaffs;

[Route("api/staff")]
[ApiController]
public class StaffController : ControllerBase
{
    private readonly IMediator _mediator;

    public StaffController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateStaffCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, CreateStaffCommand command)
    {
        var data = await _mediator.Send(new UpdateStaffCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var data = await _mediator.Send(new DeleteStaffCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var data = await _mediator.Send(new GetStaffByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> GetAll([FromQuery] GetAllStaffQuery query)
    {
        var data = await _mediator.Send(query);
        return ResponseHelper.GeneratePaginatedResponse(data);
    }

}
