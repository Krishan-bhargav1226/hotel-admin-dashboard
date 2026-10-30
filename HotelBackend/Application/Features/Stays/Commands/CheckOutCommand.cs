using Application.Common.Helpers;
using Application.Dto.Stays;
using Application.Interfaces.UnitOfWorkRepositories;
using AutoMapper;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Housekeepings;
using Domain.Entities.RatePlans;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;

namespace Application.Features.Stays.Commands;

public class CheckOutCharge
{
    public string Label { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class CheckOutCommand : IRequest<Result<GetStayDto>>
{
    public int Id { get; set; }
    public DateTime? CheckOutAt { get; set; }
    public int? RatePlanId { get; set; }
    public List<CheckOutCharge> ExtraCharges { get; set; } = new();
    public decimal Discount { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal AmountReceived { get; set; }
    public PaymentMode PaymentMode { get; set; } = PaymentMode.CASH;
    public bool AutoCleaning { get; set; } = true;
}

internal class CheckOutCommandHandler : IRequestHandler<CheckOutCommand, Result<GetStayDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CheckOutCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<GetStayDto>> Handle(CheckOutCommand request, CancellationToken cancellationToken)
    {
        var stay = await _unitOfWork.Repository<Stay>().Entities
            .Include(x => x.StayRooms)
            .Include(x => x.Charges)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (stay == null)
            return Result<GetStayDto>.BadRequest("Stay does not exist.");
        if (stay.Status == StayStatus.COMPLETED)
            return Result<GetStayDto>.BadRequest("This stay has already been checked out.");

        if ((int)request.PaymentMode == 0)
            request.PaymentMode = PaymentMode.CASH;

        if (request.RatePlanId != null && request.RatePlanId != stay.RatePlanId)
        {
            var plan = await _unitOfWork.Repository<RatePlan>().GetByID(request.RatePlanId.Value);
            if (plan == null)
                return Result<GetStayDto>.BadRequest("Rate plan does not exist.");

            stay.RatePlanId = plan.Id;
            stay.PlanName = plan.Name;
            stay.PlanKind = plan.Kind;
            stay.PlanRate = plan.Rate;
            stay.PlanDurationHours = plan.DurationHours;
            stay.PlanCheckoutTime = plan.CheckoutTime;
            stay.PlanMinHours = plan.MinHours;
            stay.PlanOvertimeRate = plan.OvertimeRate;
            stay.PlanGraceMinutes = plan.GraceMinutes;
            stay.ExpectedCheckOutAt = StayBillCalculator.ComputeExpectedCheckOut(plan.Kind, plan.DurationHours, plan.CheckoutTime, stay.CheckInAt);
        }

        foreach (var charge in stay.Charges.Where(x => !x.IsDeleted).ToList())
            await _unitOfWork.Repository<StayCharge>().DeleteAsync(charge.Id);

        foreach (var charge in request.ExtraCharges.Where(x => !string.IsNullOrWhiteSpace(x.Label)))
        {
            await _unitOfWork.Repository<StayCharge>().AddAsync(new StayCharge
            {
                StayId = stay.Id,
                Label = charge.Label.Trim(),
                Amount = charge.Amount
            });
        }

        var checkOutAt = request.CheckOutAt ?? DateTime.UtcNow;
        var roomCount = Math.Max(1, stay.StayRooms.Count(x => !x.IsDeleted));
        var bill = StayBillCalculator.Calculate(
            stay.PlanKind,
            stay.PlanName,
            stay.PlanRate,
            stay.PlanDurationHours,
            stay.PlanCheckoutTime,
            stay.PlanMinHours,
            stay.PlanOvertimeRate,
            stay.PlanGraceMinutes,
            stay.CheckInAt,
            checkOutAt,
            stay.ExpectedCheckOutAt,
            request.ExtraCharges.Sum(x => x.Amount),
            request.Discount,
            request.TaxPercent,
            roomCount);

        stay.CheckOutAt = checkOutAt;
        stay.Status = StayStatus.COMPLETED;
        stay.Discount = bill.Discount;
        stay.TaxPercent = bill.TaxPercent;
        stay.ElapsedMinutes = bill.ElapsedMinutes;
        stay.BillableHours = bill.BillableHours;
        stay.BaseLabel = bill.BaseLabel;
        stay.BaseAmount = bill.BaseAmount;
        stay.OvertimeHours = bill.OvertimeHours;
        stay.OvertimeAmount = bill.OvertimeAmount;
        stay.ExtraTotal = bill.ExtraTotal;
        stay.GrossAmount = bill.GrossAmount;
        stay.TaxableAmount = bill.TaxableAmount;
        stay.TaxAmount = bill.TaxAmount;
        stay.TotalAmount = bill.Total;
        stay.PaidAmount = stay.AdvanceAmount + request.AmountReceived;
        stay.DueAmount = Math.Max(0, bill.Total - stay.PaidAmount);
        stay.PaymentMode = request.PaymentMode;
        await _unitOfWork.Repository<Stay>().UpdateAsync(stay);

        var nextStatus = request.AutoCleaning ? RoomStatus.CLEANING : RoomStatus.AVAILABLE;
        var roomIds = stay.StayRooms.Where(x => !x.IsDeleted).Select(x => x.RoomId).Append(stay.RoomId).Distinct();
        foreach (var roomId in roomIds)
        {
            var room = await _unitOfWork.Repository<Room>().Entities.Include(x => x.RoomType)
                .FirstOrDefaultAsync(x => x.Id == roomId, cancellationToken);
            if (room == null)
                continue;

            room.Status = nextStatus;
            await _unitOfWork.Repository<Room>().UpdateAsync(room);
            if (request.AutoCleaning)
            {
                await _unitOfWork.Repository<HousekeepingTask>().AddAsync(new HousekeepingTask
                {
                    RoomId = room.Id,
                    RoomNumber = room.Number,
                    RoomTypeName = room.RoomType?.Name ?? stay.RoomTypeName,
                    Status = HousekeepingStatus.CLEANING,
                    Priority = TaskPriority.NORMAL,
                    Notes = $"Checkout {stay.StayNo}"
                });
            }
        }

        await _unitOfWork.Save(cancellationToken);
        var saved = await _unitOfWork.Repository<Stay>().Entities
            .Include(x => x.Companions)
            .Include(x => x.Charges)
            .Include(x => x.StayRooms)
            .FirstAsync(x => x.Id == stay.Id, cancellationToken);
        return Result<GetStayDto>.Success(_mapper.Map<GetStayDto>(saved), "Guest checked out successfully.");
    }
}
