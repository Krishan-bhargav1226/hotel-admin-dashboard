using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.RatePlans;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.RatePlans.Commands;

public class CreateRatePlanCommand : IRequest<Result<int>>
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    public PlanKind Kind { get; set; }
    public decimal Rate { get; set; }
    public int DurationHours { get; set; }
    public string? CheckoutTime { get; set; }
    public int MinHours { get; set; }
    public decimal OvertimeRate { get; set; }
    public int GraceMinutes { get; set; }
    public bool IsActive { get; set; } = true;
    public List<int> RoomTypeIds { get; set; } = new();
}

internal static class RatePlanRoomSync
{
    public static async Task Replace(IUnitOfWork unitOfWork, ValidationManager validationManager, RatePlan plan, IEnumerable<int> roomTypeIds, CancellationToken cancellationToken)
    {
        if (plan.Id != 0)
        {
            var existing = await unitOfWork.Repository<RatePlanRoom>().Entities
                .Where(x => x.RatePlanId == plan.Id)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            foreach (var id in existing)
                await unitOfWork.Repository<RatePlanRoom>().DeleteAsync(id);
        }

        foreach (var typeId in roomTypeIds.Distinct())
        {
            await validationManager.ValidateId<RoomType>(typeId);
            var link = new RatePlanRoom
            {
                RatePlan = plan,
                RoomTypeId = typeId
            };
            if (plan.Id != 0)
                link.RatePlanId = plan.Id;
            await unitOfWork.Repository<RatePlanRoom>().AddAsync(link);
        }
    }
}

internal class CreateRatePlanCommandHandler : IRequestHandler<CreateRatePlanCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateRatePlanCommandHandler(IUnitOfWork unitOfWork, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateRatePlanCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        _validationManager.ValidateEnum<PlanKind>((int)request.Kind);
        var plan = new RatePlan
        {
            Name = request.Name.Trim(),
            Kind = request.Kind,
            Rate = request.Rate,
            DurationHours = request.DurationHours,
            CheckoutTime = request.CheckoutTime,
            MinHours = request.MinHours,
            OvertimeRate = request.OvertimeRate,
            GraceMinutes = request.GraceMinutes,
            IsActive = request.IsActive
        };

        await _unitOfWork.Repository<RatePlan>().AddAsync(plan);
        await RatePlanRoomSync.Replace(_unitOfWork, _validationManager, plan, request.RoomTypeIds, cancellationToken);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(plan.Id, "Rate plan created successfully.");
    }
}
