using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Common.Enums.Hotels;
using Domain.Entities.Shifts;

namespace Application.Dto.Shifts;

public class GetShiftDto : BaseDto, IMapFrom<ShiftRegister>
{
    public DateOnly ShiftDate { get; set; }
    public ShiftType ShiftType { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public decimal OpeningCash { get; set; }
    public decimal CashCollected { get; set; }
    public decimal PettyExpensesPaid { get; set; }
    public decimal ClosingCashExpected { get; set; }
    public decimal ActualCashCounted { get; set; }
    public decimal CashDifference { get; set; }
    public string? HandoverNotes { get; set; }
}
