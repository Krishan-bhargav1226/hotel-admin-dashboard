using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Employees;
using Domain.Entities.SupportTickets;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Commands;

public class UpdateAssignToCommand : IRequest<Result<SupportTicket>>
{
    public UpdateAssignToCommand(int ticketId, string assignedTo)
    {
        TicketId = ticketId;
        AssignedTo = assignedTo;
    }

    public int TicketId { get; set; }
    public string AssignedTo { get; set; }
}

internal class UpdateAssignToCommandHandler : IRequestHandler<UpdateAssignToCommand, Result<SupportTicket>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public UpdateAssignToCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public async Task<Result<SupportTicket>> Handle(UpdateAssignToCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _unitOfWork.Repository<SupportTicket>()
                    .Entities.FirstOrDefaultAsync(x => x.Id == request.TicketId);

        if (ticket == null)
        {
            return Result<SupportTicket>.BadRequest("Ticket not found.");
        }


        if (ticket.AssignedToId != request.AssignedTo && request.AssignedTo != null)
        {
            var employeeExists = await _unitOfWork.Repository<Employee>()
                             .Entities
                             .FirstOrDefaultAsync(e => e.Id.ToString() == request.AssignedTo);

            if (employeeExists == null)
            {
                return Result<SupportTicket>.BadRequest("Assigned employee does not exist.");
            }


            var currentUser = await _userIdAndOrganizationIdRepository.Get();

            ticket.AssignedToId = employeeExists.UserId;

            ticket.AssignedById = currentUser.UserId;

            await _unitOfWork.Repository<SupportTicket>().UpdateAsync(ticket, request.TicketId);
            await _unitOfWork.Save(cancellationToken);
        }


        return Result<SupportTicket>.Success(ticket, "Ticket assignment updated successfully.");
    }
}
