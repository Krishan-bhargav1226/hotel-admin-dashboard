using Application.Features.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.UserLogins;

[Route("api/user")]
[ApiController]
public class UserLoginController : ControllerBase
{

    private readonly IMediator _mediator;

    public UserLoginController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [AllowAnonymous]
    [Route("login")]
    [HttpPost]
    public async Task<IActionResult> LoginUser(UserLoginCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [Route("change-password")]
    [HttpPost]
    public async Task<ActionResult> ChangePassword(ChangePasswordCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [Route("forget-password")]
    [HttpPost]
    public async Task<ActionResult> ForgetPassword(ForgetPasswordCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [Route("reset-password")]
    [HttpPost]
    public async Task<ActionResult> ResetPassword(ResetPasswordCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [HttpPost("verify-otp")]
    public async Task<ActionResult> VerifyOtp(VerifyOtpCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }

    [AllowAnonymous]
    [HttpPut("change-password/admin")]
    public async Task<ActionResult> ChangePasswordByAdmin(ChangePasswordByAdminCommand command)
    {
        var data = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(data);
    }
}
