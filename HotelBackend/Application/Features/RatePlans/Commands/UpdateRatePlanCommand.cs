using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.RatePlans;
using MediatR;
using Shared;

namespace Application.Features.RatePlans.Commands;

public class UpdateRatePlanCommand : IRequest<Result<string>>
{
    public int Id { get; set; }
    public CreateRatePlanCommand CreateCommand { get; set; }

    public UpdateRatePlanCommand(int id, CreateRatePlanCommand createCommand)
    {
        Id = id;
        CreateCommand = createCommand;
    }
}

internal class UpdateRatePlanCommandHandler : IRequestHandler<UpdateRatePlanCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public UpdateRatePlanCommandHandler(IUnitOfWork unitOfWork, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<string>> Handle(UpdateRatePlanCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<string>.BadRequest("Organization not found.");

        var plan = await _unitOfWork.Repository<RatePlan>().GetByID(request.Id);
        if (plan == null)
            return Result<string>.BadRequest("Rate plan does not exist.");

        var command = request.CreateCommand;
        _validationManager.ValidateEnum<PlanKind>((int)command.Kind);
        plan.Name = command.Name.Trim();
        plan.Kind = command.Kind;
        plan.Rate = command.Rate;
        plan.DurationHours = command.DurationHours;
        plan.CheckoutTime = command.CheckoutTime;
        plan.MinHours = command.MinHours;
        plan.OvertimeRate = command.OvertimeRate;
        plan.GraceMinutes = command.GraceMinutes;
        plan.IsActive = command.IsActive;

        await RatePlanRoomSync.Replace(_unitOfWork, _validationManager, plan, command.RoomTypeIds, cancellationToken);
        await _unitOfWork.Repository<RatePlan>().UpdateAsync(plan);
        await _unitOfWork.Save(cancellationToken);
        return Result<string>.Success("Rate plan updated successfully.");
    }
}
