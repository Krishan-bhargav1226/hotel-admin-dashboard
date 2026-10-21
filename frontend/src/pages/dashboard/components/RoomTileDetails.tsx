import { Clock3 } from "lucide-react";
import type { Room, Stay } from "../../../utils/interfaces/Interface";
import type { BillBreakdown } from "../../../utils/interfaces/Interface";
import { formatCurrency, formatDuration } from "../../../utils/helper/helper";
import { formatTime } from "../../../utils/date/dateUtils";
import type { RoomHold } from "./RoomTile";

interface RoomTileDetailsProps {
  room: Room;
  stay?: Stay;
  reservation?: RoomHold;
  running: BillBreakdown | null;
  isOverdue: boolean;
  dueSoon: boolean;
  minutesLeft: number | null;
}

export default function RoomTileDetails({ room, stay, reservation, running, isOverdue, dueSoon, minutesLeft }: RoomTileDetailsProps) {
  return <div className="flex flex-1 flex-col justify-between p-4">
    {stay && running ? <div>
      <div className="flex items-center justify-between gap-1"><span className="truncate text-sm font-semibold text-slate-900">{stay.guestName}</span><span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500">{stay.stayNo}</span></div>
      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500"><Clock3 size={13} className="shrink-0 text-slate-400" aria-hidden="true" /><span>{stay.plan.name}</span><span className="text-slate-300">·</span><span>In since {formatTime(stay.checkInAt)}</span></div>
      <div className="mt-2 flex items-baseline justify-between rounded-xl border border-slate-100/90 bg-slate-50/80 px-2.5 py-2"><Metric label="Elapsed" value={formatDuration(running.elapsedMinutes)} /><Metric label="Running bill" value={formatCurrency(running.total)} align="right" /></div>
      <DepartureNote isOverdue={isOverdue} dueSoon={dueSoon} minutesLeft={minutesLeft} expectedCheckOutAt={stay.expectedCheckOutAt} />
    </div> : <RoomReadiness room={room} reservation={reservation} />}
  </div>;
}

function DepartureNote({ isOverdue, dueSoon, minutesLeft, expectedCheckOutAt }: { isOverdue: boolean; dueSoon: boolean; minutesLeft: number | null; expectedCheckOutAt: string | null }) {
  if (isOverdue && minutesLeft !== null) {
    return <div className="mt-1.5 inline-flex items-center gap-1 rounded border border-rose-200/50 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">Overdue by {formatDuration(Math.abs(minutesLeft))}</div>;
  }
  if (dueSoon && minutesLeft !== null) {
    const label = minutesLeft > 0 ? `Due in ${formatDuration(minutesLeft)}` : "Due now";
    return <div className="mt-1.5 inline-flex items-center gap-1 rounded border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-950">{label}</div>;
  }
  if (expectedCheckOutAt) {
    return <div className="mt-1.5 text-[11px] text-slate-400">Check-out: <span className="font-medium text-slate-600">{formatTime(expectedCheckOutAt)}</span></div>;
  }
  return null;
}

function Metric({ label, value, align = "left" }: { label: string; value: string; align?: "left" | "right" }) {
  return <div className={align === "right" ? "text-right" : "text-left"}><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span><span className={`font-mono text-xs ${align === "right" ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{value}</span></div>;
}

function RoomReadiness({ room, reservation }: { room: Room; reservation?: RoomHold }) {
  const readiness = room.status === "AVAILABLE" ? { title: room.notes || "Ready for a guest", note: "Ready for the next arrival", tone: "text-slate-600" } : room.status === "CLEANING" ? { title: "Being cleaned", note: "Not ready to sell yet", tone: "text-amber-800" } : { title: "Under maintenance", note: room.notes || "Out of service", tone: "text-slate-700" };
  return <div className="flex h-full flex-col justify-center py-2.5">
    <span className={`text-xs font-medium ${readiness.tone}`}>{readiness.title}</span>
    <span className="mt-0.5 text-[11px] text-slate-400">{readiness.note}</span>
    {reservation ? <span className="mt-2 text-[11px] font-semibold text-sky-900">Booked today · {reservation.guestName}</span> : null}
  </div>;
}
