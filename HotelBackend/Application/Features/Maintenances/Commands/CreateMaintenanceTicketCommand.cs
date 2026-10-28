using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.Maintenances;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Maintenances.Commands;

public class CreateMaintenanceTicketCommand : IRequest<Result<int>>, ICreateMapFrom<MaintenanceTicket>
{
    public int RoomId { get; set; }
    [Required(ErrorMessage = "Title is required")]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;
    [StringLength(1000)]
    public string? Description { get; set; }
    public MaintenancePriority Priority { get; set; } = MaintenancePriority.MEDIUM;
    public MaintenanceStatus Status { get; set; } = MaintenanceStatus.OPEN;
    [StringLength(100)]
    public string? ReportedBy { get; set; }
    [StringLength(100)]
    public string? AssignedTo { get; set; }
    public decimal Cost { get; set; }
}

internal class CreateMaintenanceTicketCommandHandler : IRequestHandler<CreateMaintenanceTicketCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateMaintenanceTicketCommandHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateMaintenanceTicketCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        var room = await _unitOfWork.Repository<Room>().Entities
            .FirstOrDefaultAsync(x => x.Id == request.RoomId, cancellationToken);
        if (room == null)
            return Result<int>.BadRequest("Room not found.");

        var count = await _unitOfWork.Repository<MaintenanceTicket>().Entities.CountAsync(cancellationToken);
        var ticketNo = $"MT-{1000 + count + 1}";

        var entity = _mapper.Map<MaintenanceTicket>(request);
        entity.TicketNo = ticketNo;
        entity.RoomNumber = room.Number;

        room.Status = RoomStatus.MAINTENANCE;
        await _unitOfWork.Repository<Room>().UpdateAsync(room);

        await _unitOfWork.Repository<MaintenanceTicket>().AddAsync(entity);
        await _unitOfWork.Save(cancellationToken);

        return Result<int>.Success(entity.Id, "Maintenance ticket created successfully.");
    }
}
