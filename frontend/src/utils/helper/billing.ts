import dayjs from "dayjs";
import type { BillBreakdown, ExtraCharge, RatePlan } from "../interfaces/Interface";
import { formatCurrency } from "./helper";

/** When a flat-price plan ends. Hourly plans have no fixed end. */
export const computeExpectedCheckOut = (
  plan: RatePlan,
  checkInAt: string
): string | null => {
  const start = dayjs(checkInAt);
  if (plan.kind === "FIXED") {
    return start.add(plan.durationHours, "hour").toISOString();
  }
  if (plan.kind === "TILL_TIME") {
    const [h, m] = (plan.checkoutTime || "20:00").split(":").map(Number);
    let end = start.hour(h).minute(m).second(0).millisecond(0);
    if (!end.isAfter(start)) end = end.add(1, "day");
    return end.toISOString();
  }
  return null;
};

interface BillArgs {
  plan: RatePlan;
  checkInAt: string;
  checkOutAt: string;
  expectedCheckOutAt: string | null;
  extraCharges: ExtraCharge[];
  discount: number;
  taxPercent: number;
}

export const calculateBill = ({
  plan,
  checkInAt,
  checkOutAt,
  expectedCheckOutAt,
  extraCharges,
  discount,
  taxPercent,
}: BillArgs): BillBreakdown => {
  const elapsedMinutes = Math.max(
    0,
    dayjs(checkOutAt).diff(dayjs(checkInAt), "minute")
  );

  let baseAmount = 0;
  let baseLabel = "";
  let billableHours = 0;
  let overtimeHours = 0;
  let overtimeAmount = 0;

  if (plan.kind === "HOURLY") {
    const billableMinutes = Math.max(0, elapsedMinutes - plan.graceMinutes);
    billableHours = Math.max(plan.minHours || 1, Math.ceil(billableMinutes / 60));
    baseAmount = billableHours * plan.rate;
    baseLabel = `${plan.name} · ${billableHours} hr × ${formatCurrency(plan.rate)}`;
  } else {
    baseAmount = plan.rate;
    baseLabel = plan.name;
    const expected =
      expectedCheckOutAt ?? computeExpectedCheckOut(plan, checkInAt);
    if (expected) {
      const overMinutes =
        dayjs(checkOutAt).diff(dayjs(expected), "minute") - plan.graceMinutes;
      if (overMinutes > 0) {
        overtimeHours = Math.ceil(overMinutes / 60);
        overtimeAmount = overtimeHours * plan.overtimeRate;
      }
    }
  }

  const extraTotal = extraCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const grossAmount = baseAmount + overtimeAmount + extraTotal;
  const safeDiscount = Math.min(Math.max(discount || 0, 0), grossAmount);
  const taxableAmount = grossAmount - safeDiscount;
  const taxAmount = (taxableAmount * (taxPercent || 0)) / 100;

  return {
    elapsedMinutes,
    billableHours,
    baseLabel,
    baseAmount,
    overtimeHours,
    overtimeAmount,
    extraTotal,
    grossAmount,
    discount: safeDiscount,
    taxableAmount,
    taxPercent: taxPercent || 0,
    taxAmount,
    total: Math.round(taxableAmount + taxAmount),
  };
};

/** What the guest would owe if they left at the plan's included time (or the hourly minimum). */
export const estimateStayCharge = (plan: RatePlan, checkInAt: string, taxPercent: number): BillBreakdown => {
  const expected = computeExpectedCheckOut(plan, checkInAt);
  const checkOutAt = expected ?? dayjs(checkInAt).add(Math.max(plan.minHours || 1, 1), "hour").toISOString();
  return calculateBill({
    plan,
    checkInAt,
    checkOutAt,
    expectedCheckOutAt: expected,
    extraCharges: [],
    discount: 0,
    taxPercent,
  });
};

/** One-line description of a plan, used in dropdowns and summaries. */
export const describePlan = (plan: RatePlan): string => {
  if (plan.kind === "HOURLY") {
    return `${formatCurrency(plan.rate)} / hour${plan.minHours > 1 ? ` (min ${plan.minHours} hrs)` : ""}`;
  }
  if (plan.kind === "FIXED") {
    return `${formatCurrency(plan.rate)} for ${plan.durationHours} hrs`;
  }
  return `${formatCurrency(plan.rate)} till ${dayjs(`2000-01-01T${plan.checkoutTime || "20:00"}`).format("hh:mm A")}`;
};
