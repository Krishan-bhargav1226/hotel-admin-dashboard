using Application.Interfaces.Repositories.Documents;
using MediatR;
using Microsoft.AspNetCore.Http;
using Shared;

namespace Application.Features.FileUploads.Commands;

public class FileUploadCommand : IRequest<Result<string>>
{
    public IFormFile File { get; set; } = null!;

    public FileUploadCommand()
    {
    }

    public FileUploadCommand(IFormFile file)
    {
        File = file;
    }
}

internal class FileUploadCommandHandler : IRequestHandler<FileUploadCommand, Result<string>>
{
    private static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"
    };

    private readonly ICreateDocumentPath _createDocumentPath;

    public FileUploadCommandHandler(ICreateDocumentPath createDocumentPath)
    {
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<string>> Handle(FileUploadCommand request, CancellationToken cancellationToken)
    {
        if (request.File == null || request.File.Length == 0)
            return Result<string>.BadRequest("Image file is required.");

        var extension = Path.GetExtension(request.File.FileName);
        if (!ImageExtensions.Contains(extension))
            return Result<string>.BadRequest("Only jpg, jpeg, png, webp, gif and pdf files are allowed.");

        var url = await _createDocumentPath.Create(request.File);
        return Result<string>.Success(url, "Image uploaded successfully");
    }
}
