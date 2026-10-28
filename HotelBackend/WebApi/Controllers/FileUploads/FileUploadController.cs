using Application.Features.FileUploads.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers.FileUploads;

/// <summary>
/// Single image upload. Rooms, room types, POS items store only the returned URL.
/// </summary>
[Route("api/fileupload")]
[ApiController]
public class FileUploadController : ControllerBase
{
    private readonly IMediator _mediator;

    public FileUploadController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [RequestSizeLimit(15_000_000)]
    public async Task<ActionResult> Upload(IFormFile file)
    {
        var data = await _mediator.Send(new FileUploadCommand(file));
        return ResponseHelper.GenerateResponse(data);
    }
}
