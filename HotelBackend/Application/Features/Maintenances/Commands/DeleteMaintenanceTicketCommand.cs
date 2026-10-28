using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Maintenances;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Maintenances.Commands;

public record DeleteMaintenanceTicketCommand(int Id) : IRequest<Result<int>>;

internal class DeleteMaintenanceTicketCommandHandler : IRequestHandler<DeleteMaintenanceTicketCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteMaintenanceTicketCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(DeleteMaintenanceTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _unitOfWork.Repository<MaintenanceTicket>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (ticket == null)
            return Result<int>.NotFound("Maintenance ticket not found.");

        await _unitOfWork.Repository<MaintenanceTicket>().DeleteAsync(ticket);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(ticket.Id, "Maintenance ticket deleted successfully.");
    }
}
