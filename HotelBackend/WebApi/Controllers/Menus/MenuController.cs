using Application.Features.Menus.Commands;
using Application.Features.Menus.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Menus;

[Route("api/menu")]
[ApiController]
public class MenuController : ControllerBase
{
    private readonly IMediator _mediator;

    public MenuController(IMediator mediator)
    {
        _mediator = mediator;
    }


    [HttpPost]
    public async Task<IActionResult> CreateMenu([FromForm] CreateMenuCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpGet]
    public async Task<IActionResult> GetMenu()
    {
        var data = await _mediator.Send(new GetMenuQuery());
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdMenu(Guid id)
    {
        var data = await _mediator.Send(new GetByIdMenuQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMenu(Guid id, [FromForm] CreateMenuCommand command)
    {
        var data = await _mediator.Send(new UpdateMenuCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMenu(Guid id)
    {
        var data = await _mediator.Send(new DeleteMenuCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpGet("parent/{id}")]
    public async Task<ActionResult> GetMenuByParent(Guid id)
    {
        var data = await _mediator.Send(new GetMenuByParentIdQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpGet("type/{id}/menu")]
    public async Task<ActionResult> GetMenuByTypeId(int typeId)
    {
        var data = await _mediator.Send(new GetMenuByTypeIdQuery(typeId));
        return ResponseHelper.GenerateResponse(data);
    }
}
