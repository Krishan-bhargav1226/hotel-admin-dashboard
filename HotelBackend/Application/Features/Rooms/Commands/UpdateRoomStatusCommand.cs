using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Housekeepings;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Rooms.Commands;

public class RoomStatusBody
{
    public RoomStatus Status { get; set; }
}

public class UpdateRoomStatusCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public RoomStatus Status { get; set; }
    public int? PropertyId { get; set; }

    public UpdateRoomStatusCommand(int id, RoomStatus status, int? propertyId = null)
    {
        Id = id;
        Status = status;
        PropertyId = propertyId;
    }
}

internal class UpdateRoomStatusCommandHandler : IRequestHandler<UpdateRoomStatusCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ValidationManager _validationManager;

    public UpdateRoomStatusCommandHandler(IUnitOfWork unitOfWork, ValidationManager validationManager)
    {
        _unitOfWork = unitOfWork;
        _validationManager = validationManager;
    }

    public async Task<Result<string>> Handle(UpdateRoomStatusCommand request, CancellationToken cancellationToken)
    {
        _validationManager.ValidateEnum<RoomStatus>((int)request.Status);
        var room = await _unitOfWork.Repository<Room>().Entities
            .Include(x => x.RoomType)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (room == null)
            return Result<string>.BadRequest("Room does not exist.");

        room.Status = request.Status;
        request.PropertyId = room.PropertyId;
        await _unitOfWork.Repository<Room>().UpdateAsync(room);

        // Keep Housekeeping in sync with room status updates
        var task = await _unitOfWork.Repository<HousekeepingTask>().Entities
            .Where(item => item.RoomId == room.Id && !item.IsDeleted)
            .OrderByDescending(item => item.Id)
            .FirstOrDefaultAsync(cancellationToken);

        var nextHousekeepingStatus = request.Status switch
        {
            RoomStatus.AVAILABLE => HousekeepingStatus.CLEAN_INSPECTED,
            RoomStatus.MAINTENANCE => HousekeepingStatus.OUT_OF_ORDER,
            RoomStatus.CLEANING => HousekeepingStatus.CLEANING,
            _ => (HousekeepingStatus?)null
        };

        if (nextHousekeepingStatus.HasValue)
        {
            if (task == null)
            {
                task = new HousekeepingTask
                {
                    RoomId = room.Id,
                    RoomNumber = room.Number,
                    RoomTypeName = room.RoomType?.Name ?? string.Empty,
                    Status = nextHousekeepingStatus.Value,
                    Priority = TaskPriority.NORMAL,
                    IsActive = true,
                    LastCleanedAt = nextHousekeepingStatus.Value == HousekeepingStatus.CLEAN_INSPECTED ? DateTime.UtcNow : null
                };
                await _unitOfWork.Repository<HousekeepingTask>().AddAsync(task);
            }
            else
            {
                task.Status = nextHousekeepingStatus.Value;
                task.RoomNumber = room.Number;
                task.RoomTypeName = room.RoomType?.Name ?? task.RoomTypeName;
                if (nextHousekeepingStatus.Value == HousekeepingStatus.CLEAN_INSPECTED)
                    task.LastCleanedAt = DateTime.UtcNow;
                await _unitOfWork.Repository<HousekeepingTask>().UpdateAsync(task);
            }
        }

        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Room status updated successfully.");
    }
}
