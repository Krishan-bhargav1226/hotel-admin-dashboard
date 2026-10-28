using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.Maintenances;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Maintenances.Commands;

public class UpdateMaintenanceTicketCommand : IRequest<Result<int>>
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public MaintenancePriority? Priority { get; set; }
    public MaintenanceStatus? Status { get; set; }
    public string? AssignedTo { get; set; }
    public decimal? Cost { get; set; }

    public UpdateMaintenanceTicketCommand(int id)
    {
        Id = id;
    }

    public UpdateMaintenanceTicketCommand() { }
}

internal class UpdateMaintenanceTicketCommandHandler : IRequestHandler<UpdateMaintenanceTicketCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMaintenanceTicketCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(UpdateMaintenanceTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _unitOfWork.Repository<MaintenanceTicket>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (ticket == null)
            return Result<int>.NotFound("Maintenance ticket not found.");

        if (!string.IsNullOrWhiteSpace(request.Title)) ticket.Title = request.Title;
        if (request.Description != null) ticket.Description = request.Description;
        if (request.Priority.HasValue) ticket.Priority = request.Priority.Value;
        if (request.AssignedTo != null) ticket.AssignedTo = request.AssignedTo;
        if (request.Cost.HasValue) ticket.Cost = request.Cost.Value;

        if (request.Status.HasValue)
        {
            ticket.Status = request.Status.Value;
            if (ticket.Status == MaintenanceStatus.RESOLVED)
            {
                ticket.ResolvedAt = DateTime.UtcNow;
                var room = await _unitOfWork.Repository<Room>().Entities
                    .FirstOrDefaultAsync(x => x.Id == ticket.RoomId, cancellationToken);
                if (room != null && room.Status == RoomStatus.MAINTENANCE)
                {
                    room.Status = RoomStatus.CLEANING;
                    await _unitOfWork.Repository<Room>().UpdateAsync(room);
                }
            }
        }

        await _unitOfWork.Repository<MaintenanceTicket>().UpdateAsync(ticket);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(ticket.Id, "Maintenance ticket updated successfully.");
    }
}
