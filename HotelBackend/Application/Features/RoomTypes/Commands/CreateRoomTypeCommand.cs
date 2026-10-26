using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.RoomTypes.Commands;

public class CreateRoomTypeCommand : IRequest<Result<int>>, ICreateMapFrom<RoomType>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    [StringLength(500)]
    public string? Description { get; set; }
    public string? Images { get; set; }
    public RoomCategory Category { get; set; }
    [StringLength(100)]
    public string? SuitableFor { get; set; }
    [StringLength(100)]
    public string? BedConfig { get; set; }
    public int MaxGuests { get; set; }
    public int SizeSqFt { get; set; }
    public decimal BasePrice { get; set; }
    [StringLength(1000)]
    public string? Amenities { get; set; }
    [StringLength(50)]
    public string? Badge { get; set; }
    public IFormFile? ImageFile { get; set; }
    public string? Image { get; set; }
}

internal class CreateRoomTypeCommandHandler : IRequestHandler<CreateRoomTypeCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public CreateRoomTypeCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository, ICreateDocumentPath createDocumentPath)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<int>> Handle(CreateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        await Validate(request, cancellationToken);

        var entity = _mapper.Map<RoomType>(request);

        if (request.ImageFile != null)
            entity.Image = await _createDocumentPath.Create(request.ImageFile);

        await _unitOfWork.Repository<RoomType>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "RoomType created successfully.");
    }

    private async Task Validate(CreateRoomTypeCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<RoomCategory>( (int)request.Category );
        await Task.CompletedTask;
    }

}
