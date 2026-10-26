using Application.Common.Exceptions;
using Application.Interfaces.Repositories.Documents.CreateDocuments;
using Application.Interfaces.Repositories.Documents.DocumentTypes;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Documents;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Persistence.Extension.Repositories.Documents.CreateDocuments;

public class DocumentRepository : IDocumentRepository
{

    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly IDocumentTypeRepository _documentTypeRepository;

    public DocumentRepository(IWebHostEnvironment webHostEnvironment, IUnitOfWork unitOfWork, IConfiguration configuration, IDocumentTypeRepository documentTypeRepository)
    {
        _webHostEnvironment = webHostEnvironment;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _documentTypeRepository = documentTypeRepository;
    }

    public async Task<Document> Create(IFormFile from, int? documentTypeId = null, string? remark = null)
    {
        string? ImageUrl = _configuration["Image:ImagePath"];

        var fileExtension = Path.GetExtension(from.FileName).ToLower();

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", "pdf" };

        if (!allowedExtensions.Contains(fileExtension))
        {
            throw new BadRequestException("Invalid file type. Only JPG, PNG, and GIF files are allowed.");
        }

        var filename = $"{Guid.NewGuid()}{fileExtension}";

        var filePath = Path.Combine(_webHostEnvironment.WebRootPath, "Documents", filename);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await from.CopyToAsync(fileStream);
        }


        string documentTypeName;

        if (fileExtension.Equals(".jpg", StringComparison.OrdinalIgnoreCase) ||
            fileExtension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase) ||
            fileExtension.Equals(".png", StringComparison.OrdinalIgnoreCase) ||
            fileExtension.Equals(".gif", StringComparison.OrdinalIgnoreCase))
        {
            documentTypeName = "Image";
        }
        else if (fileExtension.Equals(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            documentTypeName = "PDF";
        }
        else
        {
            throw new DirectoryNotFoundException($"Unsupported file extension: {fileExtension}");
        }

        var documentType = await _documentTypeRepository.GetByName(documentTypeName);
        if (documentType == null)
        {
            throw new DirectoryNotFoundException($"DocumentType ID not found for {documentTypeName}.");
        }

        var document = new Document
        {
            Url = $"{ImageUrl}/{filename}",
            DocumentTypeId = documentType.Id,
            Remark = remark
        };

        await _unitOfWork.Repository<Document>().AddAsync(document);
        await _unitOfWork.Save(CancellationToken.None);

        return document;
    }
}

