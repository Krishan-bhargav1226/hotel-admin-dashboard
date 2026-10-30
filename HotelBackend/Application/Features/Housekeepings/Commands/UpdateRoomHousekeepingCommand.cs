using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Housekeepings;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Housekeepings.Commands;

public class UpdateRoomHousekeepingCommand : IRequest<Result<string>>
{
    public int RoomId { get; set; }
    public HousekeepingStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public string? AssignedTo { get; set; }
    public string? Notes { get; set; }
    public int? PropertyId { get; set; }
}

internal class UpdateRoomHousekeepingCommandHandler : IRequestHandler<UpdateRoomHousekeepingCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoomHousekeepingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(UpdateRoomHousekeepingCommand request, CancellationToken cancellationToken)
    {
        var room = await _unitOfWork.Repository<Room>().Entities
            .Include(item => item.RoomType)
            .FirstOrDefaultAsync(item => item.Id == request.RoomId && !item.IsDeleted, cancellationToken);
        if (room == null)
            return Result<string>.BadRequest("Room does not exist.");

        request.PropertyId = room.PropertyId;

        var task = await _unitOfWork.Repository<HousekeepingTask>().Entities
            .Where(item => item.RoomId == request.RoomId && !item.IsDeleted)
            .OrderByDescending(item => item.Id)
            .FirstOrDefaultAsync(cancellationToken);

        var priority = request.Priority == 0
            ? (task == null || (int)task.Priority == 0 ? TaskPriority.NORMAL : task.Priority)
            : request.Priority;
        var assignedTo = request.AssignedTo == null
            ? task?.AssignedTo
            : string.IsNullOrWhiteSpace(request.AssignedTo) ? null : request.AssignedTo;
        var notes = request.Notes == null ? task?.Notes : request.Notes;
        if (task == null)
        {
            task = new HousekeepingTask
            {
                RoomId = room.Id,
                RoomNumber = room.Number,
                RoomTypeName = room.RoomType?.Name ?? string.Empty,
                Status = request.Status,
                Priority = priority,
                AssignedTo = assignedTo,
                Notes = notes,
                IsActive = true,
                LastCleanedAt = request.Status == HousekeepingStatus.CLEAN_INSPECTED ? DateTime.UtcNow : null
            };
            await _unitOfWork.Repository<HousekeepingTask>().AddAsync(task);
        }
        else
        {
            task.Status = request.Status;
            task.Priority = priority;
            task.AssignedTo = assignedTo;
            task.Notes = notes;
            task.RoomNumber = room.Number;
            task.RoomTypeName = room.RoomType?.Name ?? task.RoomTypeName;
            if (request.Status == HousekeepingStatus.CLEAN_INSPECTED)
                task.LastCleanedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<HousekeepingTask>().UpdateAsync(task);
        }

        if (room.Status != RoomStatus.OCCUPIED)
        {
            room.Status = request.Status switch
            {
                HousekeepingStatus.OUT_OF_ORDER => RoomStatus.MAINTENANCE,
                HousekeepingStatus.CLEAN_INSPECTED => RoomStatus.AVAILABLE,
                _ => RoomStatus.CLEANING
            };
            await _unitOfWork.Repository<Room>().UpdateAsync(room);
        }

        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Housekeeping task updated successfully.");
    }
}
