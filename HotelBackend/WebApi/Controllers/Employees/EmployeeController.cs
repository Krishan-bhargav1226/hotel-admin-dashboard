using Application.Dto.Employees;
using Application.Features.Employees.Commands;
using Application.Features.Employees.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared;

namespace WebApi.Controllers.Employees;

[Route("api/employee")]
[ApiController]
public class EmployeeController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmployeeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromForm] CreateEmployeeCommand command)
    {
        var result = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromForm] UpdateEmployeeDto createCommand)
    {
        var command = new UpdateEmployeeCommand(id, createCommand);
        var result = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(result);
    }

    [HttpPut("current")]
    public async Task<IActionResult> UpdateCurrentEmployee([FromForm] UpdateEmployeeDto createCommand)
    {
        var command = new UpdateCurrentEmployeeCommand(createCommand);
        var result = await _mediator.Send(command);
        return ResponseHelper.GenerateResponse(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var result = await _mediator.Send(new DeleteEmployeeCommand(id));
        return ResponseHelper.GenerateResponse(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployeeById(int id)
    {
        var result = await _mediator.Send(new GetEmployeeByIdQuery(id));
        return ResponseHelper.GenerateResponse(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllEmployees([FromQuery] GetAllEmployeesQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
