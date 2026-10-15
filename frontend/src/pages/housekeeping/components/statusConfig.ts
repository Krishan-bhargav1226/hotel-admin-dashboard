import type { HousekeepingStatus } from "../../../utils/interfaces/Interface";

export const STATUS_CONFIG: Record<HousekeepingStatus, { label: string; bg: string; color: string; border: string; stage: string }> = {
  DIRTY: { label: "Needs Cleaning (Dirty)", bg: "bg-amber-50 text-amber-700", color: "#F59E0B", border: "border-amber-400", stage: "Dirty Turnover" },
  CLEANING: { label: "Cleaning In Progress", bg: "bg-sky-50 text-sky-700", color: "#0EA5E9", border: "border-sky-400", stage: "In Cleaning" },
  CLEAN_INSPECTED: { label: "Clean & Sanitized", bg: "bg-emerald-50 text-emerald-700", color: "#10B981", border: "border-emerald-400", stage: "Guest Ready" },
  OUT_OF_ORDER: { label: "Out of Order / Repair", bg: "bg-rose-50 text-rose-700", color: "#EF4444", border: "border-rose-400", stage: "Maintenance" },
};
