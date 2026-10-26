using Application.Common.Helpers;
using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Guests;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Guests.Commands;

public class CreateGuestCommand : IRequest<Result<int>>, ICreateMapFrom<Guest>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;
    [Required(ErrorMessage = "Phone is required")]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;
    [StringLength(50)]
    public string? IdType { get; set; }
    [StringLength(50)]
    public string? IdNumber { get; set; }
    [StringLength(300)]
    public string? Address { get; set; }
    public bool IsFlagged { get; set; }
    [StringLength(300)]
    public string? FlagReason { get; set; }
    public IFormFile? IdImageFile { get; set; }
    public string? IdImage { get; set; }
}

internal class CreateGuestCommandHandler : IRequestHandler<CreateGuestCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public CreateGuestCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository, ICreateDocumentPath createDocumentPath)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<int>> Handle(CreateGuestCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        request.Phone = PhoneNormalizer.Normalize(request.Phone);
        if (!ValidationManager.IsValidPhoneNumber(request.Phone))
            return Result<int>.BadRequest("Phone number must be 10 digits.");

        await Validate(request, cancellationToken);

        var duplicate = await _unitOfWork.Repository<Guest>().Entities
            .AnyAsync(x => x.Phone.ToLower() == request.Phone.ToLower(), cancellationToken);
        if (duplicate)
            return Result<int>.BadRequest($"Guest already exists.");

        var entity = _mapper.Map<Guest>(request);

        if (request.IdImageFile != null)
            entity.IdImage = await _createDocumentPath.Create(request.IdImageFile);

        await _unitOfWork.Repository<Guest>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "Guest created successfully.");
    }

    private async Task Validate(CreateGuestCommand request, CancellationToken cancellationToken)
    {
        await Task.CompletedTask;
    }

}
