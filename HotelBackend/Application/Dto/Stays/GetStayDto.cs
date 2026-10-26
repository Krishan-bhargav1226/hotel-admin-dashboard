using Application.Dto.CommonDtos;
using Domain.Entities.Hotels;

namespace Application.Dto.Stays;

public class GetStayCompanionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? IdType { get; set; }
    public string? IdNumber { get; set; }
    public string? IdImage { get; set; }
}

public class GetStayChargeDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class GetStayBillDto
{
    public int ElapsedMinutes { get; set; }
    public int BillableHours { get; set; }
    public string? BaseLabel { get; set; }
    public decimal BaseAmount { get; set; }
    public int OvertimeHours { get; set; }
    public decimal OvertimeAmount { get; set; }
    public decimal ExtraTotal { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
}

public class GetStayDto : BaseDto
{
    public string StayNo { get; set; } = string.Empty;
    public int GuestId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public string? GuestIdType { get; set; }
    public string? GuestIdNumber { get; set; }
    public string? GuestIdImage { get; set; }
    public PartyType PartyType { get; set; }
    public int GuestCount { get; set; }
    public int RoomId { get; set; }
    public List<int> RoomIds { get; set; } = new();
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public int RatePlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public PlanKind PlanKind { get; set; }
    public decimal PlanRate { get; set; }
    public int PlanDurationHours { get; set; }
    public string? PlanCheckoutTime { get; set; }
    public int PlanMinHours { get; set; }
    public decimal PlanOvertimeRate { get; set; }
    public int PlanGraceMinutes { get; set; }
    public DateTime CheckInAt { get; set; }
    public DateTime? ExpectedCheckOutAt { get; set; }
    public DateTime? CheckOutAt { get; set; }
    public StayStatus Status { get; set; }
    public decimal AdvanceAmount { get; set; }
    public PaymentMode AdvanceMode { get; set; }
    public decimal Discount { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public PaymentMode? PaymentMode { get; set; }
    public string? Notes { get; set; }
    public List<GetStayCompanionDto> Companions { get; set; } = new();
    public List<GetStayChargeDto> ExtraCharges { get; set; } = new();
    public GetStayBillDto? Bill { get; set; }
}
