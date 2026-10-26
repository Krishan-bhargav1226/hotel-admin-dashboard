using Application.Common.Mappings.Commons;
using Application.Dto.CommonDtos;
using Domain.Entities.Expenses;
using Domain.Entities.Hotels;

namespace Application.Dto.Expenses;

public class GetExpenseDto : BaseDto, IMapFrom<HotelExpense>
{
    public string Title { get; set; } = string.Empty;
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string? PaidTo { get; set; }
    public string? Notes { get; set; }
}
