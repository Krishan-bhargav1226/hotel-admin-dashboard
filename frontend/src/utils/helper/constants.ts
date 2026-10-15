import { colors } from "../theme/colorTheme";
import type { PaymentMode, PlanKind, RoomStatus } from "../interfaces/Interface";

export const ID_TYPES = [
  { id: "AADHAAR", name: "Aadhaar Card" },
  { id: "VOTER", name: "Voter ID" },
  { id: "DL", name: "Driving Licence" },
  { id: "PASSPORT", name: "Passport" },
  { id: "PAN", name: "PAN Card" },
  { id: "OTHER", name: "Other" },
];

export const PAYMENT_MODES: { id: PaymentMode; name: string }[] = [
  { id: "CASH", name: "Cash" },
  { id: "UPI", name: "UPI" },
  { id: "CARD", name: "Card" },
];

export const PLAN_KINDS: { id: PlanKind; name: string; hint: string }[] = [
  { id: "HOURLY", name: "Hourly", hint: "Rate per hour, e.g. ₹200 / hour" },
  { id: "FIXED", name: "Fixed hours", hint: "Flat price for N hours, e.g. 24 hrs = ₹1800" },
  { id: "TILL_TIME", name: "Till a time", hint: "Flat price till a clock time, e.g. day use till 8 PM = ₹1200" },
];

export const ROOM_STATUS: Record<RoomStatus, { label: string; color: string }> = {
  AVAILABLE: { label: "Available", color: colors.status.available },
  OCCUPIED: { label: "Occupied", color: colors.status.occupied },
  CLEANING: { label: "Cleaning", color: colors.status.cleaning },
  MAINTENANCE: { label: "Maintenance", color: colors.status.maintenance },
};

export const idTypeName = (id?: string) =>
  ID_TYPES.find((t) => t.id === id)?.name ?? id ?? "-";

export const planKindName = (id?: PlanKind) =>
  PLAN_KINDS.find((k) => k.id === id)?.name ?? "-";
