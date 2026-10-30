using Application.Features.Notifications.Commands;
using Application.Features.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Notifications;

[Route("api/notification")]
[ApiController]
[Authorize(Roles = "SuperAdmin")]
public class NotificationController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var data = await _mediator.Send(new GetAdminNotificationsQuery());
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpPut("{id:int}/read")]
    public async Task<ActionResult> MarkRead(int id)
    {
        var data = await _mediator.Send(new MarkNotificationReadCommand { Id = id });
        return ResponseHelper.GenerateResponse(data);
    }
}
