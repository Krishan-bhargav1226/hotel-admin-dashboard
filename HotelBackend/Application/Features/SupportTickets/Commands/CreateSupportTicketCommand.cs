using Application.Interfaces.Repositories.Documents.CreateDocuments;
using Application.Interfaces.Repositories.SupportTicketDocuments;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums;
using Domain.Common.Enums.PriorityTypes;
using Domain.Common.Enums.RequestedSources;
using Domain.Common.Enums.Responses;
using Domain.Entities.SupportTickets;
using Domain.Entities.SupportTickets.TicketConversations;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.SupportTickets.Commands;

public class CreateSupportTicketCommand : IRequest<Result<SupportTicket>>
{
    public RequestedSourceType RequestedSource { get; set; }
    public int? TicketTypeId { get; set; }
    public PriorityType? Priority { get; set; }
    public int? DepartmentId { get; set; }
    public string Subject { get; set; }
    public string Description { get; set; }
    public List<IFormFile>? Documents { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public long? Phone { get; set; }
    public long? AlternetPhone { get; set; }

}
internal class SupportTicketCommandHandler : IRequestHandler<CreateSupportTicketCommand, Result<SupportTicket>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userIdAndOrganizationIdRepository;
    private readonly IDocumentRepository _documentRepository;
    private readonly ITicketConversationDocumentRepository _supportTicketDocumentRepository;

    public SupportTicketCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, IUserIdAndOrganizationIdRepository userIdAndOrganizationIdRepository, IDocumentRepository documentRepository, ITicketConversationDocumentRepository supportTicketDocumentRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userIdAndOrganizationIdRepository = userIdAndOrganizationIdRepository;
        _documentRepository = documentRepository;
        _supportTicketDocumentRepository = supportTicketDocumentRepository;
    }

    public async Task<Result<SupportTicket>> Handle(CreateSupportTicketCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userIdAndOrganizationIdRepository.Get();

        //var department = new Department();

        //if (request.DepartmentId != null)
        //{
        //    department = await _unitOfWork.Repository<Department>().GetByID((int)request.DepartmentId);

        //}

        //if (department == null)
        //{
        //    return Result<SupportTicket>.BadRequest("departmentId not exist");
        //}

        var supportTicket = new SupportTicket
        {
            Code = await GetCode(),
            RequestById = userOrg.UserId != "" && userOrg.UserId != null ? userOrg.UserId : null,
            RequestedSource = request.RequestedSource,
            TicketTypeId = request.TicketTypeId,
            RequestOrganizationId = userOrg.OrganizationId ?? 29,
            CreatedOn = DateTime.UtcNow,
            Priority = request.Priority,
            Status = SupportStatus.Requested,
            //DepartmentId = request.DepartmentId,
            Subject = request.Subject,
            Description = request.Description,
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            AlternetPhone = request.AlternetPhone,
        };
        await _unitOfWork.Repository<SupportTicket>().AddAsync(supportTicket);
        await _unitOfWork.Save(cancellationToken);

        var ticketConversation = new TicketConversation
        {
            ResponseBy = ResponseBy.User,
            Subject = request.Subject,
            Description = request.Description,
            SupportTicketId = supportTicket.Id
        };

        await _unitOfWork.Repository<TicketConversation>().AddAsync(ticketConversation);
        await _unitOfWork.Save(cancellationToken);


        foreach (var i in request.Documents ?? [])
        {
            var document = await _documentRepository.Create(i, 1);

            await _supportTicketDocumentRepository.Create(ticketConversation.Id, document.Id);
        }

        return Result<SupportTicket>.Success("Ticket Created Successfully.");

    }

    private async Task<string> GetCode()
    {
        string maxCode = await _unitOfWork.Repository<SupportTicket>().Entities.MaxAsync(x => x.Code);

        int nextNumber = 1;
        if (!string.IsNullOrEmpty(maxCode))
        {
            string numberPart = maxCode.Substring(1);
            if (int.TryParse(numberPart, out int currentNumber))
            {
                nextNumber = currentNumber + 1;
            }
        }
        return $"T{nextNumber:D5}";
    }
}
