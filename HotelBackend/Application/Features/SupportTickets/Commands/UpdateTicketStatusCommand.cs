using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums;
using Domain.Entities.SupportTickets;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Commands;

public class UpdateTicketStatusCommand : IRequest<Result<SupportTicket>>
{
    public UpdateTicketStatusCommand(int ticketId, int status)
    {
        TicketId = ticketId;
        Status = status;
    }

    public int TicketId { get; set; }
    public int Status { get; set; }
}

internal class UpdateTicketStatusCommandHandler : IRequestHandler<UpdateTicketStatusCommand, Result<SupportTicket>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateTicketStatusCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupportTicket>> Handle(UpdateTicketStatusCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _unitOfWork.Repository<SupportTicket>()
              .Entities.FirstOrDefaultAsync(x => x.Id == request.TicketId);

        if (ticket == null)
        {
            return Result<SupportTicket>.BadRequest("Ticket not found.");
        }

        ticket.Status = (SupportStatus)request.Status;

        await _unitOfWork.Repository<SupportTicket>().UpdateAsync(ticket, request.TicketId);
        await _unitOfWork.Save(cancellationToken);

        return Result<SupportTicket>.Success(ticket, "Ticket status updated successfully.");

    }
}
