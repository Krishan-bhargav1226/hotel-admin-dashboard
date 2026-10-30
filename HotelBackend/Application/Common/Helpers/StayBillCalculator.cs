using Domain.Common.Enums.Hotels;

namespace Application.Common.Helpers;

public class StayBillResult
{
    public int ElapsedMinutes { get; set; }
    public int BillableHours { get; set; }
    public string BaseLabel { get; set; } = string.Empty;
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

public static class StayBillCalculator
{
    public static DateTime? ComputeExpectedCheckOut(PlanKind kind, int durationHours, string? checkoutTime, DateTime checkInAt)
    {
        if (kind == PlanKind.FIXED)
            return checkInAt.AddHours(durationHours);

        if (kind == PlanKind.TILL_TIME)
        {
            var parts = (string.IsNullOrWhiteSpace(checkoutTime) ? "20:00" : checkoutTime).Split(':');
            var hour = int.Parse(parts[0]);
            var minute = parts.Length > 1 ? int.Parse(parts[1]) : 0;
            var end = new DateTime(checkInAt.Year, checkInAt.Month, checkInAt.Day, hour, minute, 0, checkInAt.Kind);
            if (end <= checkInAt)
                end = end.AddDays(1);
            return end;
        }

        return null;
    }

    public static StayBillResult Calculate(
        PlanKind kind,
        string planName,
        decimal rate,
        int durationHours,
        string? checkoutTime,
        int minHours,
        decimal overtimeRate,
        int graceMinutes,
        DateTime checkInAt,
        DateTime checkOutAt,
        DateTime? expectedCheckOutAt,
        decimal extraTotal,
        decimal discount,
        decimal taxPercent,
        int roomCount)
    {
        var elapsed = (int)Math.Max(0, (checkOutAt - checkInAt).TotalMinutes);
        decimal baseAmount;
        var baseLabel = planName;
        var billableHours = 0;
        var overtimeHours = 0;
        decimal overtimeAmount = 0;

        if (kind == PlanKind.HOURLY)
        {
            var billableMinutes = Math.Max(0, elapsed - graceMinutes);
            billableHours = Math.Max(minHours > 0 ? minHours : 1, (int)Math.Ceiling(billableMinutes / 60d));
            baseAmount = billableHours * rate;
            baseLabel = $"{planName} · {billableHours} hr";
        }
        else
        {
            baseAmount = rate;
            var expected = expectedCheckOutAt ?? ComputeExpectedCheckOut(kind, durationHours, checkoutTime, checkInAt);
            if (expected != null)
            {
                var overMinutes = (checkOutAt - expected.Value).TotalMinutes - graceMinutes;
                if (overMinutes > 0)
                {
                    overtimeHours = (int)Math.Ceiling(overMinutes / 60d);
                    overtimeAmount = overtimeHours * overtimeRate;
                }
            }
        }

        var rooms = Math.Max(1, roomCount);
        baseAmount *= rooms;
        overtimeAmount *= rooms;
        var gross = baseAmount + overtimeAmount + extraTotal;
        var safeDiscount = Math.Min(Math.Max(discount, 0), gross);
        var taxable = gross - safeDiscount;
        var tax = taxPercent < 0 ? 0 : taxPercent;
        var taxAmount = taxable * tax / 100m;
        var total = Math.Round(taxable + taxAmount, 0, MidpointRounding.AwayFromZero);

        return new StayBillResult
        {
            ElapsedMinutes = elapsed,
            BillableHours = billableHours,
            BaseLabel = baseLabel,
            BaseAmount = baseAmount,
            OvertimeHours = overtimeHours,
            OvertimeAmount = overtimeAmount,
            ExtraTotal = extraTotal,
            GrossAmount = gross,
            Discount = safeDiscount,
            TaxableAmount = taxable,
            TaxPercent = tax,
            TaxAmount = taxAmount,
            Total = total
        };
    }
}
