using Application.Features.HotelSettings.Commands;
using Application.Features.HotelSettings.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.HotelSettings;

[Route("api/settings")]
[ApiController]
public class HotelSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public HotelSettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    public async Task<ActionResult> Get()
    {
        var data = await _mediator.Send(new GetHotelSettingQuery());
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut]
    public async Task<ActionResult> Update(UpdateHotelSettingCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }
}
