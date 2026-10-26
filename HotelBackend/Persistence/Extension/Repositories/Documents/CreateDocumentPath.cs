using Application.Common.Exceptions;
using Application.Interfaces.Repositories.Documents;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Persistence.Extensions.Repositories.Documents;

public class CreateDocumentPath : ICreateDocumentPath
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IConfiguration _configuration;

    public CreateDocumentPath(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
    {
        _webHostEnvironment = webHostEnvironment;
        _configuration = configuration;
    }

    public async Task<string> Create(IFormFile file)
    {
        await IsValidFile(file);

        string? imageUrl = _configuration["Image:ImagePath"];
        var fileExtension = Path.GetExtension(file.FileName).ToLower();

        var filename = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_webHostEnvironment.WebRootPath, "Documents", filename);

        var directoryPath = Path.GetDirectoryName(filePath);

        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        return $"{imageUrl}/{filename}";
    }

    public void DeleteDocument(string url)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(url))
            {
                var uri = new Uri(url);

                string relativePath = uri.AbsolutePath.TrimStart('/');

                string filePath = Path.Combine(_webHostEnvironment.WebRootPath, relativePath);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
        }
        catch
        {

        }
    }

    private async Task IsValidFile(IFormFile file)
    {
        var allowedExtensions = new HashSet<string>
            {
                // Images
                ".jpg", ".jpeg", ".png", ".webp",
            
                // Documents
                ".pdf", ".xlsx", ".xls", ".docx", ".html", ".js", ".css",
            
                // Audio
                ".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac",
            
                // Video
                ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"
            };

        var allowedMimeTypes = new HashSet<string>
            {
                // Images
                "image/jpeg", // .jpg, .jpeg
                "image/png",  // .png
                "image/webp", // .webp
            
                // Documents
                "application/pdf", // .pdf
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                "application/vnd.ms-excel", // .xls
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
                "text/html", // .html
                "application/javascript", // .js
                "text/javascript", // alternative JS MIME type
                "text/css", // .css
            
                // Audio
                "audio/mpeg", // .mp3
                "audio/wav",  // .wav
                "audio/ogg",  // .ogg
                "audio/mp4",  // .m4a
                "audio/aac",  // .aac
                "audio/flac", // .flac
            
                // Video
                "video/mp4",  // .mp4
                "video/webm", // .webm
                "video/ogg",  // .ogg
                "video/quicktime", // .mov
                "video/x-msvideo", // .avi
                "video/x-matroska" // .mkv
            };


        string fileExtension = Path.GetExtension(file.FileName).ToLower();
        string mimeType = file.ContentType.ToLower();

        if (!allowedExtensions.Contains(fileExtension) || !allowedMimeTypes.Contains(mimeType))
        {
            throw new BadRequestException("invalid file type or extension");
        }
    }

}
