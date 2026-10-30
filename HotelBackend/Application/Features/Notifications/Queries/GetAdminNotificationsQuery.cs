using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Notifications.Queries;

public class AdminNotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? SubjectUserId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? CreatedDate { get; set; }
}

public class GetAdminNotificationsQuery : IRequest<Result<List<AdminNotificationDto>>>
{
}

internal class GetAdminNotificationsQueryHandler : IRequestHandler<GetAdminNotificationsQuery, Result<List<AdminNotificationDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _caller;

    public GetAdminNotificationsQueryHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository caller)
    {
        _unitOfWork = unitOfWork;
        _caller = caller;
    }

    public async Task<Result<List<AdminNotificationDto>>> Handle(GetAdminNotificationsQuery request, CancellationToken cancellationToken)
    {
        var current = await _caller.Get();
        if (!current.IsSuperAdmin)
            return Result<List<AdminNotificationDto>>.BadRequest("Only a Super Admin can read these notifications.");

        var items = await _unitOfWork.Repository<AdminNotification>().Entities
            .OrderByDescending(x => x.CreatedDate)
            .Take(30)
            .Select(x => new AdminNotificationDto
            {
                Id = x.Id,
                Title = x.Title,
                Message = x.Message,
                SubjectUserId = x.SubjectUserId,
                IsRead = x.IsRead,
                CreatedDate = x.CreatedDate
            })
            .ToListAsync(cancellationToken);

        return Result<List<AdminNotificationDto>>.Success(items, "Notifications loaded.");
    }
}
