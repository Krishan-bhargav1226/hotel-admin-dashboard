using Application.Features.Roles.Command;
using Application.Features.Roles.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.UserRoles;

[Route("api/role")]
[ApiController]
[Authorize(Roles = "SuperAdmin")]
public class RoleController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoleController(IMediator mediator)
    {
        _mediator = mediator;
    }


    [HttpPost]
    public async Task<IActionResult> CreateRole(CreateRoleCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    public async Task<IActionResult> GetRole()
    {
        var data = await _mediator.Send(new GetAllRoleQuery());
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdRole(Guid id)
    {
        var data = await _mediator.Send(new GetRoleByIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRole(Guid id, CreateRoleCommand command)
    {
        var data = await _mediator.Send(new UpdateRoleCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var data = await _mediator.Send(new DeleteRoleCommand(id));
        return ResponseHelper.GenerateResponse(data);

    }

    [HttpPut("/api/user/{id}/role")]
    public async Task<ActionResult> CreateUserRole(string id, AssignUserAccessCommand command)
    {
        command.UserId = id;
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

}
