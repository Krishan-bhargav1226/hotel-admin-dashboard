using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.Properties;
using Domain.Entities.Rooms;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Rooms.Commands;

public class CreateBulkRoomCommand : IRequest<Result<int>>
{
    public int From { get; set; }
    public int To { get; set; }
    public string Floor { get; set; } = string.Empty;
    public int RoomTypeId { get; set; }
    public string? Prefix { get; set; }
    public int? PropertyId { get; set; }
}

internal class CreateBulkRoomCommandHandler : IRequestHandler<CreateBulkRoomCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateBulkRoomCommandHandler(IUnitOfWork unitOfWork, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateBulkRoomCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        if (request.To < request.From)
            return Result<int>.BadRequest("To room number must be greater than from room number.");
        if (request.To - request.From > 199)
            return Result<int>.BadRequest("Cannot add more than 200 rooms at once.");

        await _validationManager.ValidateId<RoomType>(request.RoomTypeId);
        await _validationManager.ValidateId<HotelProperty>(request.PropertyId);

        var roomType = await _unitOfWork.Repository<RoomType>().GetByID(request.RoomTypeId);
        if (roomType == null)
            return Result<int>.BadRequest("Room type does not exist.");

        var existing = await _unitOfWork.Repository<Room>().Entities
            .Select(x => x.Number.ToLower())
            .ToListAsync(cancellationToken);

        var added = 0;
        for (var number = request.From; number <= request.To; number++)
        {
            var roomNumber = $"{request.Prefix}{number}";
            if (existing.Contains(roomNumber.ToLower()))
                continue;

            var room = new Room
            {
                Number = roomNumber,
                Floor = request.Floor?.Trim(),
                RoomTypeId = request.RoomTypeId,
                PropertyId = request.PropertyId,
                Status = RoomStatus.AVAILABLE,
                Category = roomType.Category,
                MaxGuests = roomType.MaxGuests,
                SizeSqFt = roomType.SizeSqFt,
                BasePrice = roomType.BasePrice,
                BedType = roomType.BedConfig,
                BedConfig = roomType.BedConfig,
                SuitableFor = roomType.SuitableFor,
                Amenities = roomType.Amenities,
                Badge = roomType.Badge,
                Image = roomType.Image,
                Images = roomType.Images
            };

            await _unitOfWork.Repository<Room>().AddAsync(room);
            added++;
        }

        if (added == 0)
            return Result<int>.BadRequest("Every room number in this range already exists.");

        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(added, $"{added} rooms created successfully.");
    }
}
