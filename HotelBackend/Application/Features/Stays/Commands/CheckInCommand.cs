using Application.Common.Helpers;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Guests;
using Domain.Entities.Hotels;
using Domain.Entities.RatePlans;
using Domain.Entities.Reservations;
using Domain.Entities.Rooms;
using Domain.Entities.Stays;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Stays.Commands;

public class CheckInGuest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;
    public string? IdType { get; set; }
    public string? IdNumber { get; set; }
    public string? IdImage { get; set; }
    public string? Address { get; set; }
}

public class CheckInCompanion
{
    public string? Name { get; set; }
    public string? IdType { get; set; }
    public string? IdNumber { get; set; }
    public string? IdImage { get; set; }
}

public class CheckInCommand : IRequest<Result<int>>
{
    public CheckInGuest Guest { get; set; } = new();
    public List<CheckInCompanion> Companions { get; set; } = new();
    public PartyType PartyType { get; set; } = PartyType.SOLO;
    public int GuestCount { get; set; }
    public List<int> RoomIds { get; set; } = new();
    public int RatePlanId { get; set; }
    public DateTime? CheckInAt { get; set; }
    public decimal AdvanceAmount { get; set; }
    public PaymentMode AdvanceMode { get; set; } = PaymentMode.CASH;
    public decimal TaxPercent { get; set; }
    public string? Notes { get; set; }
    public int? ReservationId { get; set; }
}

internal class CheckInCommandHandler : IRequestHandler<CheckInCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CheckInCommandHandler(IUnitOfWork unitOfWork, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CheckInCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        var phone = PhoneNormalizer.Normalize(request.Guest.Phone);
        if (!ValidationManager.IsValidPhoneNumber(phone))
            return Result<int>.BadRequest("Phone number must be 10 digits.");

        var roomIds = request.RoomIds.Where(x => x > 0).Distinct().ToList();
        if (roomIds.Count == 0)
            return Result<int>.BadRequest("Select at least one room.");

        if ((int)request.PartyType == 0)
            request.PartyType = PartyType.SOLO;
        if ((int)request.AdvanceMode == 0)
            request.AdvanceMode = PaymentMode.CASH;

        _validationManager.ValidateEnum<PartyType>((int)request.PartyType);
        _validationManager.ValidateEnum<PaymentMode>((int)request.AdvanceMode);
        await _validationManager.ValidateId<RatePlan>(request.RatePlanId);

        var rooms = await _unitOfWork.Repository<Room>().Entities
            .Include(x => x.RoomType)
            .Where(x => roomIds.Contains(x.Id))
            .ToListAsync(cancellationToken);
        if (rooms.Count != roomIds.Count)
            return Result<int>.BadRequest("Room does not exist.");

        var unavailable = rooms.FirstOrDefault(x => x.Status != RoomStatus.AVAILABLE);
        if (unavailable != null)
            return Result<int>.BadRequest($"Room {unavailable.Number} is not currently available.");

        var plan = await _unitOfWork.Repository<RatePlan>().GetByID(request.RatePlanId);
        if (plan == null || !plan.IsActive)
            return Result<int>.BadRequest("Rate plan does not exist.");

        var allowedTypes = await _unitOfWork.Repository<RatePlanRoom>().Entities
            .Where(x => x.RatePlanId == plan.Id)
            .Select(x => x.RoomTypeId)
            .ToListAsync(cancellationToken);
        if (allowedTypes.Count > 0 && rooms.Any(x => !allowedTypes.Contains(x.RoomTypeId)))
            return Result<int>.BadRequest("Rate plan does not apply to the selected room type.");

        Reservation? reservation = null;
        if (request.ReservationId != null)
        {
            reservation = await _unitOfWork.Repository<Reservation>().GetByID(request.ReservationId.Value);
            if (reservation == null)
                return Result<int>.BadRequest("Reservation does not exist.");
            if (reservation.Status != ReservationStatus.CONFIRMED)
                return Result<int>.BadRequest("Only a confirmed reservation can be checked in.");
        }

        var checkInAt = request.CheckInAt ?? DateTime.UtcNow;
        var today = DateOnly.FromDateTime(checkInAt);
        foreach (var room in rooms)
        {
            var reserved = await _unitOfWork.Repository<Reservation>().Entities.AnyAsync(x =>
                x.RoomId == room.Id
                && x.Status == ReservationStatus.CONFIRMED
                && x.CheckInDate <= today
                && x.CheckOutDate > today
                && x.Id != request.ReservationId, cancellationToken);
            if (reserved)
                return Result<int>.BadRequest($"Room {room.Number} is reserved for another booking.");
        }

        var guest = await _unitOfWork.Repository<Guest>().Entities
            .FirstOrDefaultAsync(x => x.Phone == phone, cancellationToken);
        if (guest == null)
        {
            guest = new Guest
            {
                Name = request.Guest.Name.Trim(),
                Phone = phone,
                IdType = request.Guest.IdType,
                IdNumber = request.Guest.IdNumber,
                IdImage = request.Guest.IdImage,
                Address = request.Guest.Address
            };
            await _unitOfWork.Repository<Guest>().AddAsync(guest);
        }
        else
        {
            guest.Name = request.Guest.Name.Trim();
            guest.IdType = request.Guest.IdType ?? guest.IdType;
            guest.IdNumber = request.Guest.IdNumber ?? guest.IdNumber;
            guest.IdImage = string.IsNullOrWhiteSpace(request.Guest.IdImage) ? guest.IdImage : request.Guest.IdImage;
            guest.Address = string.IsNullOrWhiteSpace(request.Guest.Address) ? guest.Address : request.Guest.Address;
            await _unitOfWork.Repository<Guest>().UpdateAsync(guest);
        }

        await _unitOfWork.Save(cancellationToken);

        var primary = rooms[0];
        var count = await _unitOfWork.Repository<Stay>().Entities.IgnoreQueryFilters()
            .CountAsync(x => x.OrganizationId == userOrg.OrganizationId, cancellationToken);
        var companions = request.Companions
            .Where(x => !string.IsNullOrWhiteSpace(x.Name))
            .ToList();

        var stay = new Stay
        {
            StayNo = CodeGenerator.Next("ST", count),
            GuestId = guest.Id,
            GuestName = guest.Name,
            GuestPhone = phone,
            GuestIdType = guest.IdType,
            GuestIdNumber = guest.IdNumber,
            GuestIdImage = guest.IdImage,
            PartyType = request.PartyType,
            GuestCount = Math.Max(1, request.GuestCount > 0 ? request.GuestCount : 1 + companions.Count),
            RoomId = primary.Id,
            RoomNumber = string.Join(", ", rooms.Select(x => x.Number)),
            RoomTypeName = string.Join(", ", rooms.Select(x => x.RoomType?.Name).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct()),
            RatePlanId = plan.Id,
            PlanName = plan.Name,
            PlanKind = plan.Kind,
            PlanRate = plan.Rate,
            PlanDurationHours = plan.DurationHours,
            PlanCheckoutTime = plan.CheckoutTime,
            PlanMinHours = plan.MinHours,
            PlanOvertimeRate = plan.OvertimeRate,
            PlanGraceMinutes = plan.GraceMinutes,
            CheckInAt = checkInAt,
            ExpectedCheckOutAt = StayBillCalculator.ComputeExpectedCheckOut(plan.Kind, plan.DurationHours, plan.CheckoutTime, checkInAt),
            Status = StayStatus.ACTIVE,
            AdvanceAmount = request.AdvanceAmount,
            AdvanceMode = request.AdvanceMode,
            TaxPercent = request.TaxPercent,
            PaidAmount = request.AdvanceAmount,
            Notes = request.Notes
        };

        await _unitOfWork.Repository<Stay>().AddAsync(stay);
        foreach (var room in rooms)
        {
            room.Status = RoomStatus.OCCUPIED;
            await _unitOfWork.Repository<Room>().UpdateAsync(room);
            await _unitOfWork.Repository<StayRoom>().AddAsync(new StayRoom { Stay = stay, RoomId = room.Id });
        }

        foreach (var companion in companions)
        {
            await _unitOfWork.Repository<StayCompanion>().AddAsync(new StayCompanion
            {
                Stay = stay,
                Name = companion.Name!.Trim(),
                IdType = companion.IdType,
                IdNumber = companion.IdNumber,
                IdImage = companion.IdImage
            });
        }

        await _unitOfWork.Save(cancellationToken);

        if (reservation != null)
        {
            reservation.Status = ReservationStatus.CHECKED_IN;
            reservation.StayId = stay.Id;
            await _unitOfWork.Repository<Reservation>().UpdateAsync(reservation);
            await _unitOfWork.Save(cancellationToken);
        }
        return Result<int>.Success(stay.Id, "Guest checked in successfully.");
    }
}
