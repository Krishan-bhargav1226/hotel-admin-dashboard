using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.PriorityTypes;
using Domain.Entities.SupportTickets;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Commands;

public class UpdatePriorityCommand : IRequest<Result<SupportTicket>>
{
    public UpdatePriorityCommand(int ticketId, PriorityType priority)
    {
        TicketId = ticketId;
        Priority = priority;
    }

    public int TicketId { get; set; }
    public PriorityType Priority { get; set; }
}

internal class UpdatePriorityCommandHandler : IRequestHandler<UpdatePriorityCommand, Result<SupportTicket>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;

    public UpdatePriorityCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
    }

    public async Task<Result<SupportTicket>> Handle(UpdatePriorityCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _unitOfWork.Repository<SupportTicket>()
                    .Entities.FirstOrDefaultAsync(x => x.Id == request.TicketId);

        if (ticket == null)
        {
            return Result<SupportTicket>.BadRequest("Ticket not found.");
        }


        if (ticket.Priority != request.Priority)
        {
            if (!Enum.IsDefined(typeof(PriorityType), request.Priority))
            {
                return Result<SupportTicket>.BadRequest("Priority does not exist.");
            }


            var currentUser = await _userIdAndOrganizationIdRepository.Get();

            ticket.Priority = request.Priority;



            await _unitOfWork.Repository<SupportTicket>().UpdateAsync(ticket, ticket.Id);
            await _unitOfWork.Save(cancellationToken);
        }


        return Result<SupportTicket>.Success(ticket, "Priority updated successfully.");
    }
}
