using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.Reservations;
using MediatR;
using Shared;

namespace Application.Features.Reservations.Commands;

public class UpdateReservationStatusCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public ReservationStatus Status { get; set; }

    public UpdateReservationStatusCommand(int id, ReservationStatus status)
    {
        Id = id;
        Status = status;
    }
}

internal class UpdateReservationStatusCommandHandler : IRequestHandler<UpdateReservationStatusCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateReservationStatusCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(UpdateReservationStatusCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.Repository<Reservation>().GetByID(request.Id);
        if (reservation == null)
            return Result<string>.BadRequest("Reservation does not exist.");
        if (reservation.Status == ReservationStatus.CHECKED_IN)
            return Result<string>.BadRequest("A checked-in reservation cannot change status here.");
        if (request.Status != ReservationStatus.CANCELLED && request.Status != ReservationStatus.NO_SHOW && request.Status != ReservationStatus.CONFIRMED)
            return Result<string>.BadRequest("Status is not valid for this action.");

        reservation.Status = request.Status;
        await _unitOfWork.Repository<Reservation>().UpdateAsync(reservation);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Reservation updated successfully.");
    }
}

public class DeleteReservationCommand : IRequest<Result<string>>
{
    public int Id { get; set; }

    public DeleteReservationCommand(int id)
    {
        Id = id;
    }
}

internal class DeleteReservationCommandHandler : IRequestHandler<DeleteReservationCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteReservationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(DeleteReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.Repository<Reservation>().GetByID(request.Id);
        if (reservation == null)
            return Result<string>.BadRequest("Reservation does not exist.");
        if (reservation.Status == ReservationStatus.CHECKED_IN)
            return Result<string>.BadRequest("A checked-in reservation cannot be deleted.");

        await _unitOfWork.Repository<Reservation>().DeleteAsync(reservation.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Reservation deleted successfully.");
    }
}
