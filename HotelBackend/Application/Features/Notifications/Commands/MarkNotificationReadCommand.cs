using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Notifications;
using MediatR;
using Shared;

namespace Application.Features.Notifications.Commands;

public class MarkNotificationReadCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
}

internal class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserIdAndOrganizationIdRepository _caller;

    public MarkNotificationReadCommandHandler(IUnitOfWork unitOfWork, IUserIdAndOrganizationIdRepository caller)
    {
        _unitOfWork = unitOfWork;
        _caller = caller;
    }

    public async Task<Result<string>> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        var current = await _caller.Get();
        if (!current.IsSuperAdmin)
            return Result<string>.BadRequest("Only a Super Admin can update notifications.");

        var entity = await _unitOfWork.Repository<AdminNotification>().GetByID(request.Id);
        if (entity == null)
            return Result<string>.BadRequest("Notification does not exist.");

        entity.IsRead = true;
        await _unitOfWork.Repository<AdminNotification>().UpdateAsync(entity, entity.Id);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Notification marked as read.");
    }
}
