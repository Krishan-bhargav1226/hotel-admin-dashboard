using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.Rooms;
using MediatR;
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

    public UpdateRoomStatusCommand(int id, RoomStatus status)
    {
        Id = id;
        Status = status;
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
        var room = await _unitOfWork.Repository<Room>().GetByID(request.Id);
        if (room == null)
            return Result<string>.BadRequest("Room does not exist.");

        room.Status = request.Status;
        await _unitOfWork.Repository<Room>().UpdateAsync(room);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Room status updated successfully.");
    }
}
