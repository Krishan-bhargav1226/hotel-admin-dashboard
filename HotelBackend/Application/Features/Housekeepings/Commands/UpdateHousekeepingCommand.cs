using Application.Dto.Housekeepings;
using Application.Features.Commons;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Entities.Hotels;
using Domain.Entities.Housekeepings;
using Domain.Entities.Rooms;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Housekeepings.Commands;

public class UpdateHousekeepingCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public HousekeepingStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public string? AssignedTo { get; set; }
    public string? Notes { get; set; }

    public UpdateHousekeepingCommand(int id, HousekeepingStatus status, TaskPriority priority, string? assignedTo, string? notes)
    {
        Id = id;
        Status = status;
        Priority = priority;
        AssignedTo = assignedTo;
        Notes = notes;
    }
}

internal class UpdateHousekeepingCommandHandler : IRequestHandler<UpdateHousekeepingCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateHousekeepingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(UpdateHousekeepingCommand request, CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.Repository<HousekeepingTask>().GetByID(request.Id);
        if (task == null)
            return Result<string>.BadRequest("Housekeeping task does not exist.");

        task.Status = request.Status;
        task.Priority = request.Priority;
        task.AssignedTo = request.AssignedTo;
        task.Notes = request.Notes;
        if (request.Status == HousekeepingStatus.CLEAN_INSPECTED)
            task.LastCleanedAt = DateTime.UtcNow;

        var room = await _unitOfWork.Repository<Room>().GetByID(task.RoomId);
        if (room != null && room.Status != RoomStatus.OCCUPIED)
        {
            room.Status = request.Status switch
            {
                HousekeepingStatus.OUT_OF_ORDER => RoomStatus.MAINTENANCE,
                HousekeepingStatus.CLEAN_INSPECTED => RoomStatus.AVAILABLE,
                _ => RoomStatus.CLEANING
            };
            await _unitOfWork.Repository<Room>().UpdateAsync(room);
        }

        await _unitOfWork.Repository<HousekeepingTask>().UpdateAsync(task);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Housekeeping task updated successfully.");
    }
}

public class GetAllHousekeepingQuery : IRequest<PaginatedResult<GetHousekeepingDto>>
{
    public HousekeepingStatus? Status { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

internal class GetAllHousekeepingQueryHandler : IRequestHandler<GetAllHousekeepingQuery, PaginatedResult<GetHousekeepingDto>>
{
    private readonly IQueryContext _queryContext;
    private readonly IMapper _mapper;

    public GetAllHousekeepingQueryHandler(IQueryContext queryContext, IMapper mapper)
    {
        _queryContext = queryContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetHousekeepingDto>> Handle(GetAllHousekeepingQuery request, CancellationToken cancellationToken)
    {
        var query = _queryContext.Repository<HousekeepingTask>().Entities.AsQueryable();
        if (request.Status != null)
            query = query.Where(x => x.Status == request.Status);
        query = query.OrderByDescending(x => x.UpdatedDate);
        return await ListQuery.ToPagedResultAsync<HousekeepingTask, GetHousekeepingDto>(query, request.PageNumber, request.PageSize, _mapper, cancellationToken);
    }
}
