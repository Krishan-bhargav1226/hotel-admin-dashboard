import type { BillBreakdown, Stay } from "../interfaces/Interface";

/** Room ids occupied by a stay (supports older records that only have roomId). */
export const stayRoomIds = (stay: Pick<Stay, "roomId" | "roomIds">): string[] => {
  if (stay.roomIds?.length) return stay.roomIds;
  return stay.roomId ? [stay.roomId] : [];
};

export const stayRoomCount = (stay: Pick<Stay, "roomId" | "roomIds">) =>
  Math.max(1, stayRoomIds(stay).length);

export const stayOccupiesRoom = (stay: Pick<Stay, "roomId" | "roomIds">, roomId: string) =>
  stayRoomIds(stay).includes(roomId);

export const partyTypeLabel = (type?: Stay["partyType"]) => {
  if (type === "COUPLE") return "Couple";
  if (type === "FAMILY") return "Family";
  return "Solo";
};

/** Scale room charges for multi-room stays; extras and discount stay as entered. */
export const billForStayRooms = (bill: BillBreakdown, roomCount: number): BillBreakdown => {
  const n = Math.max(1, roomCount);
  if (n === 1) return bill;
  const baseAmount = bill.baseAmount * n;
  const overtimeAmount = bill.overtimeAmount * n;
  const grossAmount = baseAmount + overtimeAmount + bill.extraTotal;
  const taxableAmount = Math.max(0, grossAmount - bill.discount);
  const taxAmount = (taxableAmount * bill.taxPercent) / 100;
  return {
    ...bill,
    baseAmount,
    overtimeAmount,
    grossAmount,
    taxableAmount,
    taxAmount,
    total: taxableAmount + taxAmount,
  };
};

export const stayHeadcount = (stay: Pick<Stay, "guestCount" | "companions">) => {
  if (stay.guestCount && stay.guestCount > 0) return stay.guestCount;
  return 1 + stay.companions.filter((companion) => companion.name.trim()).length;
};
