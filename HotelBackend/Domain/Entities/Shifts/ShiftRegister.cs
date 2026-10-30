using Domain.Common;
using Domain.Common.Enums.Hotels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.Shifts;

public class ShiftRegister : BaseAuditableEntity
{
    public DateOnly ShiftDate { get; set; }
    public ShiftType ShiftType { get; set; }

    [Required]
    [StringLength(150)]
    public string StaffName { get; set; } = string.Empty;
    public decimal OpeningCash { get; set; }
    public decimal CashCollected { get; set; }
    public decimal PettyExpensesPaid { get; set; }
    public decimal ClosingCashExpected { get; set; }
    public decimal ActualCashCounted { get; set; }
    public decimal CashDifference { get; set; }

    [StringLength(1000)]
    public string? HandoverNotes { get; set; }
}
