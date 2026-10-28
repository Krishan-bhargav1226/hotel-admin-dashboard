using Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Reports;

[Route("api/report")]
[ApiController]
public class ReportController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Dashboard & Reports KPI, 7-day revenue trend, room performance, and category breakdown.
    /// </summary>
    [HttpGet]
    [HttpGet("all")]
    [HttpGet("getall")]
    [HttpGet("summary")]
    public async Task<ActionResult> Summary([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var data = await _mediator.Send(new GetReportsSummaryQuery(from, to));
        return ResponseHelper.GenerateResponse(data);
    }
}
