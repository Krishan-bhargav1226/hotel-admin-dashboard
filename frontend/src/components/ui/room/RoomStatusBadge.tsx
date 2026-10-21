import { BedDouble, CalendarClock, CircleCheck, Sparkles, Wrench, type LucideIcon } from "lucide-react";
import type { RoomStatus } from "../../../utils/interfaces/Interface";

export type DisplayRoomStatus = RoomStatus | "RESERVED";

const STYLE: Record<DisplayRoomStatus, { label: string; icon: LucideIcon; classes: string }> = {
  AVAILABLE: { label: "Available", icon: CircleCheck, classes: "border-emerald-200/80 bg-emerald-50 text-emerald-900" },
  OCCUPIED: { label: "Occupied", icon: BedDouble, classes: "border-rose-200/80 bg-rose-50 text-rose-900" },
  CLEANING: { label: "Cleaning", icon: Sparkles, classes: "border-amber-200/80 bg-amber-50 text-amber-950" },
  MAINTENANCE: { label: "Maintenance", icon: Wrench, classes: "border-slate-300 bg-slate-100 text-slate-800" },
  RESERVED: { label: "Reserved", icon: CalendarClock, classes: "border-sky-200/80 bg-sky-50 text-sky-950" },
};

export default function RoomStatusBadge({ status }: { status: DisplayRoomStatus }) {
  const item = STYLE[status];
  const Icon = item.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold shadow-xs ${item.classes}`}>
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {item.label}
    </span>
  );
}
