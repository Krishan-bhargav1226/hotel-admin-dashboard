using Application.Features.NightAudits.Commands;
using Application.Features.NightAudits.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.NightAudits;

[Route("api/night-audit")]
[ApiController]
public class NightAuditController : ControllerBase
{
    private readonly IMediator _mediator;

    public NightAuditController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var data = await _mediator.Send(new GetAllNightAuditQuery());
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPost]
    public async Task<ActionResult> Execute(ExecuteNightAuditCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }
}
