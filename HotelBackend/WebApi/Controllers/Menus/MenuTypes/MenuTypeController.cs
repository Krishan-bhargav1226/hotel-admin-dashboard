using Application.Features.Menus.MenuTypes.Commands;
using Application.Features.Menus.MenuTypes.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.Menus.MenuTypes;


[Route("api/menu/type")]
[ApiController]
public class MenuTypeController : ControllerBase
{
    private readonly IMediator _mediator;
    public MenuTypeController(IMediator mediator)
    {
        _mediator = mediator;
    }


    [HttpPost]
    public async Task<IActionResult> CreateMenuType(CreateMenuTypeCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpGet]
    public async Task<IActionResult> GetMenuType()
    {
        var data = await _mediator.Send(new GetMenuTypeQuery());
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdMenuType(int id)
    {
        var data = await _mediator.Send(new GetByIdMenuTypeQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMenuType(int id, CreateMenuTypeCommand command)
    {
        var data = await _mediator.Send(new UpdateMenuTypeCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMenuType(int id)
    {
        var data = await _mediator.Send(new DeleteMenuTypeCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }
}
