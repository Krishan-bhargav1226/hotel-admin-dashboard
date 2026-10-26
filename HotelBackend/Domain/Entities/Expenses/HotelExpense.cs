using Domain.Common;
using Domain.Entities.Hotels;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.Expenses;

public class HotelExpense : BaseAuditableEntity
{
    [Required]
    [StringLength(150)]
    public string Title { get; set; } = string.Empty;
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public DateOnly ExpenseDate { get; set; }

    [StringLength(150)]
    public string? PaidTo { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
