using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.Documents;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Properties;
using Domain.Entities.RoomTypes;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Rooms.Commands;

public class UpdateRoomCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateRoomCommand CreateCommand { get; set; }

    public UpdateRoomCommand(int id, CreateRoomCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;
    private readonly ICreateDocumentPath _createDocumentPath;

    public UpdateRoomCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository, ICreateDocumentPath createDocumentPath)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
        _createDocumentPath = createDocumentPath;
    }

    public async Task<Result<string>> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var entity = await _unitOfWork.Repository<Room>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Room does not exist.");

        // The room form edits number, floor, type, notes, bed, and photo.
        // Unsent value types arrive as 0 and would fail enum checks or wipe price and capacity.
        if ((int)request.CreateCommand.Status == 0)
            request.CreateCommand.Status = entity.Status == 0 ? RoomStatus.AVAILABLE : entity.Status;

        await Validate(request.CreateCommand, cancellationToken);

        var duplicate = await _unitOfWork.Repository<Room>().Entities
            .AnyAsync(x => x.Id != request.Id && x.Number.ToLower() == request.CreateCommand.Number.ToLower(), cancellationToken);
        if (duplicate)
            return Result<string>.BadRequest($"Room already exists.");

        var previous = new
        {
            entity.BasePrice,
            entity.MaxGuests,
            entity.SizeSqFt,
            entity.Category,
            entity.PropertyId,
            entity.SuitableFor,
            entity.BedConfig,
            entity.Amenities,
            entity.Badge,
            entity.Images,
            entity.Image,
            entity.BedType
        };

        _mapper.Map(request.CreateCommand, entity);

        if (request.CreateCommand.BasePrice == 0)
            entity.BasePrice = previous.BasePrice;
        if (request.CreateCommand.MaxGuests == 0)
            entity.MaxGuests = previous.MaxGuests;
        if (request.CreateCommand.SizeSqFt == 0)
            entity.SizeSqFt = previous.SizeSqFt;
        if ((int)request.CreateCommand.Category == 0)
            entity.Category = previous.Category;
        if (request.CreateCommand.PropertyId == null)
            entity.PropertyId = previous.PropertyId;
        if (request.CreateCommand.SuitableFor == null)
            entity.SuitableFor = previous.SuitableFor;
        if (request.CreateCommand.BedConfig == null)
            entity.BedConfig = previous.BedConfig;
        if (request.CreateCommand.Amenities == null)
            entity.Amenities = previous.Amenities;
        if (request.CreateCommand.Badge == null)
            entity.Badge = previous.Badge;
        if (request.CreateCommand.Images == null)
            entity.Images = previous.Images;
        if (request.CreateCommand.Image == null && request.CreateCommand.ImageFile == null)
            entity.Image = previous.Image;
        if (request.CreateCommand.BedType == null)
            entity.BedType = previous.BedType;

        if (request.CreateCommand.ImageFile != null)
        {
            if (!string.IsNullOrWhiteSpace(entity.Image))
                _createDocumentPath.DeleteDocument(entity.Image);
            entity.Image = await _createDocumentPath.Create(request.CreateCommand.ImageFile);
        }

        var roomType = await _unitOfWork.Repository<RoomType>().GetByID(request.CreateCommand.RoomTypeId);
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
            if (string.IsNullOrWhiteSpace(entity.Image) && request.CreateCommand.ImageFile == null)
                entity.Image = roomType.Image ?? previous.Image;
            if (string.IsNullOrWhiteSpace(entity.Images))
                entity.Images = roomType.Images ?? previous.Images;
        }

        await _unitOfWork.Repository<Room>().UpdateAsync(entity);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Room updated successfully.");
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
