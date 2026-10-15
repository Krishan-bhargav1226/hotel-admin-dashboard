import dayjs from "dayjs";
import type { Room, Stay } from "../interfaces/Interface";

export interface Range {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
}

export const toRange = (from: string, to: string, fallbackDays = 30): Range => ({
  from: from ? dayjs(from).startOf("day") : dayjs().subtract(fallbackDays, "day").startOf("day"),
  to: to ? dayjs(to).endOf("day") : dayjs().endOf("day"),
});

const inRange = (iso: string | null, r: Range) =>
  !!iso && !dayjs(iso).isBefore(r.from) && !dayjs(iso).isAfter(r.to);

/** Revenue is counted on the day of check-out. */
export const completedIn = (stays: Stay[], r: Range) =>
  stays.filter((s) => s.status === "COMPLETED" && inRange(s.checkOutAt, r));

export const checkInsIn = (stays: Stay[], r: Range) =>
  stays.filter((s) => inRange(s.checkInAt, r));

export const revenueByDay = (stays: Stay[], r: Range) => {
  const done = completedIn(stays, r);
  const days = r.to.startOf("day").diff(r.from.startOf("day"), "day") + 1;
  return Array.from({ length: Math.min(days, 92) }, (_, i) => {
    const d = r.from.startOf("day").add(i, "day");
    const list = done.filter((s) => dayjs(s.checkOutAt).isSame(d, "day"));
    return {
      date: d.format("DD MMM"),
      revenue: list.reduce((sum, s) => sum + s.totalAmount, 0),
      stays: list.length,
    };
  });
};

export const revenueByPlan = (stays: Stay[]) => {
  const map = new Map<string, { name: string; revenue: number; stays: number }>();
  stays.forEach((s) => {
    const row = map.get(s.plan.name) ?? { name: s.plan.name, revenue: 0, stays: 0 };
    row.revenue += s.totalAmount;
    row.stays += 1;
    map.set(s.plan.name, row);
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
};

/** Advance goes to the advance mode, the rest to the final payment mode. */
export const collectionByMode = (stays: Stay[]) => {
  const totals: Record<string, number> = { CASH: 0, UPI: 0, CARD: 0 };
  stays.forEach((s) => {
    const advance = Math.min(s.advanceAmount, s.paidAmount);
    totals[s.advanceMode] += advance;
    if (s.paymentMode) totals[s.paymentMode] += s.paidAmount - advance;
  });
  return Object.entries(totals).map(([name, value]) => ({ name, value }));
};

export const peakCheckInHours = (stays: Stay[]) => {
  const counts = Array.from({ length: 24 }, () => 0);
  stays.forEach((s) => (counts[dayjs(s.checkInAt).hour()] += 1));
  return counts.map((count, h) => ({ hour: dayjs().hour(h).format("hA"), count }));
};

export const roomStats = (done: Stay[], rooms: Room[], r: Range) => {
  const hoursInRange = Math.max(1, r.to.diff(r.from, "hour"));
  return rooms.map((room) => {
    const list = done.filter((s) => s.roomId === room.id);
    const minutes = list.reduce((sum, s) => sum + (s.bill?.elapsedMinutes ?? 0), 0);
    return {
      roomNumber: room.number,
      stays: list.length,
      revenue: list.reduce((sum, s) => sum + s.totalAmount, 0),
      occupiedHours: Math.round(minutes / 60),
      occupancy: Math.min(100, Math.round((minutes / 60 / hoursInRange) * 100)),
    };
  });
};

export const topGuests = (done: Stay[], limit = 5) => {
  const map = new Map<string, { name: string; phone: string; visits: number; spent: number }>();
  done.forEach((s) => {
    const row = map.get(s.guestId) ?? { name: s.guestName, phone: s.guestPhone, visits: 0, spent: 0 };
    row.visits += 1;
    row.spent += s.totalAmount;
    map.set(s.guestId, row);
  });
  return [...map.values()].sort((a, b) => b.spent - a.spent).slice(0, limit);
};

/** Share of check-ins in the range from guests who had stayed before. */
export const repeatGuestPercent = (all: Stay[], inRangeStays: Stay[]) => {
  if (!inRangeStays.length) return 0;
  const repeat = inRangeStays.filter((s) =>
    all.some((o) => o.guestId === s.guestId && o.checkInAt < s.checkInAt)
  ).length;
  return Math.round((repeat / inRangeStays.length) * 100);
};
