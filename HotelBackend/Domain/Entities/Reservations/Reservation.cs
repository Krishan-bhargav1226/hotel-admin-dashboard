using Domain.Common;
using Domain.Common.Enums.Hotels;
using Domain.Entities.RoomTypes;
using Domain.Entities.Rooms;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities.Reservations;

public class Reservation : BaseAuditableEntity
{
    [Required]
    [StringLength(20)]
    public string BookingNo { get; set; } = string.Empty;

    [Required]
    [StringLength(150)]
    public string GuestName { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string GuestPhone { get; set; } = string.Empty;

    [StringLength(150)]
    public string? GuestEmail { get; set; }

    [ForeignKey("Room")]
    public int? RoomId { get; set; }
    public Room? Room { get; set; }

    [StringLength(20)]
    public string? RoomNumber { get; set; }

    [ForeignKey("RoomType")]
    public int RoomTypeId { get; set; }
    public RoomType? RoomType { get; set; }

    [StringLength(100)]
    public string RoomTypeName { get; set; } = string.Empty;
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public int Nights { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AdvanceAmount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public BookingSource Source { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.CONFIRMED;

    [StringLength(500)]
    public string? SpecialRequests { get; set; }
    public int? StayId { get; set; }
}
