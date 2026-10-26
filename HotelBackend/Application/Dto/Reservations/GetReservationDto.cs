using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.Hotels;
using Domain.Entities.Reservations;

namespace Application.Dto.Reservations;

public class GetReservationDto : BaseDto, IMapFrom<Reservation>
{
    public string BookingNo { get; set; } = string.Empty;
    public string GuestName { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public int? RoomId { get; set; }
    public string? RoomNumber { get; set; }
    public int RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public int Nights { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AdvanceAmount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public BookingSource Source { get; set; }
    public ReservationStatus Status { get; set; }
    public string? SpecialRequests { get; set; }
    public int? StayId { get; set; }
}
