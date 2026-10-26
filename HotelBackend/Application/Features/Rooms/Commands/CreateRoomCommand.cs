using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.Properties;
using Domain.Entities.RoomTypes;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Rooms.Commands;

public class CreateRoomCommand : IRequest<Result<int>>, ICreateMapFrom<Room>
{
    [Required(ErrorMessage = "Number is required")]
    [StringLength(20)]
    public string Number { get; set; } = string.Empty;
    [StringLength(20)]
    public string? Floor { get; set; }
    public int RoomTypeId { get; set; }
    public RoomStatus Status { get; set; }
    [StringLength(500)]
    public string? Notes { get; set; }
    public string? Images { get; set; }
    [StringLength(50)]
    public string? BedType { get; set; }
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
    public int? PropertyId { get; set; }
    public IFormFile? ImageFile { get; set; }
    public string? Image { get; set; }
}

internal class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public CreateRoomCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository, ICreateDocumentPath createDocumentPath)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<int>> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        if ((int)request.Status == 0)
            request.Status = RoomStatus.AVAILABLE;

        await Validate(request, cancellationToken);

        var duplicate = await _unitOfWork.Repository<Room>().Entities
            .AnyAsync(x => x.Number.ToLower() == request.Number.ToLower(), cancellationToken);
        if (duplicate)
            return Result<int>.BadRequest($"Room already exists.");

        var entity = _mapper.Map<Room>(request);

        if (request.ImageFile != null)
            entity.Image = await _createDocumentPath.Create(request.ImageFile);

        var roomType = await _unitOfWork.Repository<RoomType>().GetByID(request.RoomTypeId);
        if (roomType != null)
        {
            if (entity.Category == 0)
                entity.Category = roomType.Category;
            if (entity.MaxGuests == 0)
                entity.MaxGuests = roomType.MaxGuests;
            if (entity.SizeSqFt == 0)
                entity.SizeSqFt = roomType.SizeSqFt;
            if (entity.BasePrice == 0)
                entity.BasePrice = roomType.BasePrice;
            if (string.IsNullOrWhiteSpace(entity.BedType))
                entity.BedType = roomType.BedConfig;
            if (string.IsNullOrWhiteSpace(entity.BedConfig))
                entity.BedConfig = roomType.BedConfig;
            if (string.IsNullOrWhiteSpace(entity.SuitableFor))
                entity.SuitableFor = roomType.SuitableFor;
            if (string.IsNullOrWhiteSpace(entity.Amenities))
                entity.Amenities = roomType.Amenities;
            if (string.IsNullOrWhiteSpace(entity.Badge))
                entity.Badge = roomType.Badge;
            if (string.IsNullOrWhiteSpace(entity.Image))
                entity.Image = roomType.Image;
            if (string.IsNullOrWhiteSpace(entity.Images))
                entity.Images = roomType.Images;
        }

        await _unitOfWork.Repository<Room>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(entity.Id, "Room created successfully.");
    }

    private async Task Validate(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<RoomStatus>( (int)request.Status );
        if ((int)request.Category != 0)
            _validationManager.ValidateEnum<RoomCategory>( (int)request.Category );
        await _validationManager.ValidateId<RoomType>(request.RoomTypeId);
        await _validationManager.ValidateId<HotelProperty>(request.PropertyId);
    }

}
