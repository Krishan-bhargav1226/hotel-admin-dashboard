import { Clock, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDuration } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import type { BillBreakdown, Room, Stay } from "../../../utils/interfaces/Interface";

interface StayCardSummaryProps { stay: Stay; room?: Room; bill: BillBreakdown | null; active: boolean; overdue: boolean; dueSoon: boolean; minutesLeft: number | null; }

export default function StayCardSummary({ stay, room, bill, active, overdue, dueSoon, minutesLeft }: StayCardSummaryProps) {
  return <div>
    <div className="flex items-start justify-between"><div className="flex items-baseline gap-2"><span className="font-mono text-xl font-bold tracking-tight text-slate-900">Room {stay.roomNumber}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{room?.floor || "Floor 1"}</span></div>{room?.bedConfig && <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{room.bedConfig}</span>}</div>
    <div className="mt-0.5 truncate text-xs font-medium text-slate-500">{stay.roomTypeName}</div>
    <div className="mt-3 border-t border-slate-100 pt-2.5"><div className="flex items-center justify-between"><span className="truncate text-sm font-semibold text-slate-900">{stay.guestName}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">{stay.stayNo}</span></div><div className="mt-0.5 text-xs text-slate-500">{stay.guestPhone}{((stay.guestCount ?? 0) > 1 || stay.companions.length > 0) && <span className="ml-1 text-[11px] font-medium text-brand-700">· {stay.guestCount || 1 + stay.companions.length} guests</span>}{(stay.roomIds?.length ?? 0) > 1 && <span className="ml-1 text-[11px] font-medium text-brand-700">· {stay.roomIds?.length} rooms</span>}</div></div>
    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"><Clock size={13} className="shrink-0 text-slate-400" /><span>{stay.plan.name}</span><span className="text-slate-300">·</span><span>In since {formatDateTime(stay.checkInAt)}</span></div>
    <div className="mt-3 space-y-1.5 rounded-xl border border-slate-100/90 bg-slate-50/80 p-2.5"><SummaryLine label={active ? "Elapsed Time" : "Stay Duration"} value={bill ? formatDuration(bill.elapsedMinutes) : "—"} /><SummaryLine label="Advance Paid" value={formatCurrency(stay.advanceAmount || stay.paidAmount || 0)} tone="text-emerald-700" /><SummaryLine label={active ? "Current Folio Bill" : "Settled Total"} value={bill ? formatCurrency(bill.total) : formatCurrency(stay.totalAmount)} bold /></div>
    {overdue && minutesLeft !== null ? <div className="mt-2 inline-flex items-center gap-1 rounded border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800"><AlertTriangle size={13} /><span>Checkout overdue by {formatDuration(Math.abs(minutesLeft))}</span></div> : dueSoon && minutesLeft !== null ? <div className="mt-2 inline-flex items-center gap-1 rounded border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-950"><AlertTriangle size={13} /><span>{minutesLeft > 0 ? `Due in ${formatDuration(minutesLeft)}` : "Due now"}</span></div> : stay.expectedCheckOutAt && active ? <div className="mt-2 text-[11px] text-slate-400">Scheduled departure: <strong className="font-semibold text-slate-700">{formatDateTime(stay.expectedCheckOutAt)}</strong></div> : stay.checkOutAt ? <div className="mt-2 text-[11px] text-slate-400">Departed: {formatDateTime(stay.checkOutAt)}</div> : null}
  </div>;
}

function SummaryLine({ label, value, tone = "text-slate-700", bold = false }: { label: string; value: string; tone?: string; bold?: boolean }) {
  return <div className={`flex items-center justify-between border-b border-slate-200/60 pb-1 text-xs last:border-0 last:pb-0 ${bold ? "pt-1" : ""}`}><span className={`text-[10px] uppercase ${bold ? "font-bold text-slate-600" : "font-semibold text-slate-400"}`}>{label}</span><span className={`font-mono ${bold ? "text-sm font-bold text-slate-900" : `font-medium ${tone}`}`}>{value}</span></div>;
}
