using Application.Common.Helpers;
using Application.Common.Mappings.Commons;
using Application.Features.Commons;
using Application.Interfaces.Repositories.UserIdAndOrganizationIds;
using Application.Interfaces.UnitOfWorkRepositories;
using Domain.Entities.Hotels;
using Domain.Entities.Reservations;
using Domain.Entities.Rooms;
using Domain.Entities.RoomTypes;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared;
using System.ComponentModel.DataAnnotations;

namespace Application.Features.Reservations.Commands;

public class CreateReservationCommand : IRequest<Result<int>>, ICreateMapFrom<Reservation>
{
    [Required]
    public string GuestName { get; set; } = string.Empty;

    [Required]
    public string GuestPhone { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public int? RoomId { get; set; }
    public int RoomTypeId { get; set; }
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AdvanceAmount { get; set; }
    public PaymentMode PaymentMode { get; set; } = PaymentMode.CASH;
    public BookingSource Source { get; set; } = BookingSource.PHONE;
    public string? SpecialRequests { get; set; }
}

internal class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ValidationManager _validationManager;
    private readonly IUserIdAndOrganizationIdRepository _userOrganizationRepository;

    public CreateReservationCommandHandler(IUnitOfWork unitOfWork, ValidationManager validationManager, IUserIdAndOrganizationIdRepository userOrganizationRepository)
    {
        _unitOfWork = unitOfWork;
        _validationManager = validationManager;
        _userOrganizationRepository = userOrganizationRepository;
    }

    public async Task<Result<int>> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var userOrg = await _userOrganizationRepository.Get();
        if (userOrg.OrganizationId == null)
            return Result<int>.BadRequest("Organization not found.");

        var phone = PhoneNormalizer.Normalize(request.GuestPhone);
        if (!ValidationManager.IsValidPhoneNumber(phone))
            return Result<int>.BadRequest("Phone number must be 10 digits.");
        if (request.CheckOutDate <= request.CheckInDate)
            return Result<int>.BadRequest("Check-out date must be after check-in date.");

        if ((int)request.PaymentMode == 0)
            request.PaymentMode = PaymentMode.CASH;
        if ((int)request.Source == 0)
            request.Source = BookingSource.PHONE;

        _validationManager.ValidateEnum<PaymentMode>((int)request.PaymentMode);
        _validationManager.ValidateEnum<BookingSource>((int)request.Source);
        await _validationManager.ValidateId<RoomType>(request.RoomTypeId);
        await _validationManager.ValidateId<Room>(request.RoomId);

        var roomType = await _unitOfWork.Repository<RoomType>().GetByID(request.RoomTypeId);
        Room? room = null;
        if (request.RoomId != null)
        {
            room = await _unitOfWork.Repository<Room>().GetByID(request.RoomId.Value);
            if (room == null)
                return Result<int>.BadRequest("Room does not exist.");
            if (room.RoomTypeId != request.RoomTypeId)
                return Result<int>.BadRequest("Selected room does not match the room type.");

            var overlap = await _unitOfWork.Repository<Reservation>().Entities.AnyAsync(x =>
                x.RoomId == room.Id
                && x.Status == ReservationStatus.CONFIRMED
                && x.CheckInDate < request.CheckOutDate
                && x.CheckOutDate > request.CheckInDate, cancellationToken);
            if (overlap)
                return Result<int>.BadRequest($"Room {room.Number} is already reserved for those dates.");
        }

        var count = await _unitOfWork.Repository<Reservation>().Entities.IgnoreQueryFilters()
            .CountAsync(x => x.OrganizationId == userOrg.OrganizationId, cancellationToken);

        var reservation = new Reservation
        {
            BookingNo = CodeGenerator.Next("BK", count),
            GuestName = request.GuestName.Trim(),
            GuestPhone = phone,
            GuestEmail = request.GuestEmail,
            RoomId = room?.Id,
            RoomNumber = room?.Number,
            RoomTypeId = request.RoomTypeId,
            RoomTypeName = roomType?.Name ?? string.Empty,
            CheckInDate = request.CheckInDate,
            CheckOutDate = request.CheckOutDate,
            Nights = request.CheckOutDate.DayNumber - request.CheckInDate.DayNumber,
            TotalAmount = request.TotalAmount,
            AdvanceAmount = request.AdvanceAmount,
            PaymentMode = request.PaymentMode,
            Source = request.Source,
            Status = ReservationStatus.CONFIRMED,
            SpecialRequests = request.SpecialRequests
        };

        await _unitOfWork.Repository<Reservation>().AddAsync(reservation);
        await _unitOfWork.Save(cancellationToken);
        return Result<int>.Success(reservation.Id, "Reservation created successfully.");
    }
}
