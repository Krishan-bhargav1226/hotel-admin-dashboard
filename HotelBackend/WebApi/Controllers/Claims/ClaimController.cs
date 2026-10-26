using Application.Features.Claims.Command;
using Application.Features.Claims.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.UserClaims;


[Route("api/user/claim")]
[ApiController]
public class ClaimController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClaimController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateClaim(CreateClaimCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllClaim()
    {
        var data = await _mediator.Send(new GetClaimQuery());
        return ResponseHelper.GenerateResponse(data);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetByIdClaim(int id)
    {
        var data = await _mediator.Send(new GetByIdClaimQuery(id));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClaim(int id, CreateClaimCommand command)
    {
        var data = await _mediator.Send(new UpdateClaimCommand(id, command));
        return ResponseHelper.GenerateResponse(data);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClaim(int id)
    {
        var data = await _mediator.Send(new DeleteClaimCommand(id));
        return ResponseHelper.GenerateResponse(data);
    }
}
