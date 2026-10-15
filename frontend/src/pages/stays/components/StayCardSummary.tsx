import dayjs from "dayjs";
import { MdAccessTime, MdWarning } from "react-icons/md";
import { formatCurrency, formatDuration } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import type { BillBreakdown, Room, Stay } from "../../../utils/interfaces/Interface";

interface StayCardSummaryProps { stay: Stay; room?: Room; bill: BillBreakdown | null; active: boolean; overdue: boolean; overdueMinutes: number; }

export default function StayCardSummary({ stay, room, bill, active, overdue, overdueMinutes }: StayCardSummaryProps) {
  return <div>
    <div className="flex items-start justify-between"><div className="flex items-baseline gap-2"><span className="font-mono text-xl font-bold tracking-tight text-slate-900">Room {stay.roomNumber}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{room?.floor || "Floor 1"}</span></div>{room?.bedConfig && <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{room.bedConfig}</span>}</div>
    <div className="mt-0.5 truncate text-xs font-medium text-slate-500">{stay.roomTypeName}</div>
    <div className="mt-3 border-t border-slate-100 pt-2.5"><div className="flex items-center justify-between"><span className="truncate text-sm font-semibold text-slate-900">{stay.guestName}</span><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">{stay.stayNo}</span></div><div className="mt-0.5 text-xs text-slate-500">{stay.guestPhone}{stay.companions.length > 0 && <span className="ml-1 text-[11px] font-medium text-brand-700">· +{stay.companions.length} co-guest</span>}</div></div>
    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"><MdAccessTime size={13} className="shrink-0 text-slate-400" /><span>{stay.plan.name}</span><span className="text-slate-300">·</span><span>In since {dayjs(stay.checkInAt).format("DD MMM, hh:mm A")}</span></div>
    <div className="mt-3 space-y-1.5 rounded-xl border border-slate-100/90 bg-slate-50/80 p-2.5"><SummaryLine label={active ? "Elapsed Time" : "Stay Duration"} value={bill ? formatDuration(bill.elapsedMinutes) : "—"} /><SummaryLine label="Advance Paid" value={formatCurrency(stay.advanceAmount || stay.paidAmount || 0)} tone="text-emerald-700" /><SummaryLine label={active ? "Current Folio Bill" : "Settled Total"} value={bill ? formatCurrency(bill.total) : formatCurrency(stay.totalAmount)} bold /></div>
    {overdue ? <div className="mt-2 inline-flex items-center gap-1 rounded border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700"><MdWarning size={13} /><span>Checkout Overdue by {formatDuration(overdueMinutes)}</span></div> : stay.expectedCheckOutAt && active ? <div className="mt-2 text-[11px] text-slate-400">Scheduled departure: <strong className="font-semibold text-slate-700">{dayjs(stay.expectedCheckOutAt).format("hh:mm A, DD MMM")}</strong></div> : stay.checkOutAt ? <div className="mt-2 text-[11px] text-slate-400">Departed: {formatDateTime(stay.checkOutAt)}</div> : null}
  </div>;
}

function SummaryLine({ label, value, tone = "text-slate-700", bold = false }: { label: string; value: string; tone?: string; bold?: boolean }) {
  return <div className={`flex items-center justify-between border-b border-slate-200/60 pb-1 text-xs last:border-0 last:pb-0 ${bold ? "pt-1" : ""}`}><span className={`text-[10px] uppercase ${bold ? "font-bold text-slate-600" : "font-semibold text-slate-400"}`}>{label}</span><span className={`font-mono ${bold ? "text-sm font-bold text-slate-900" : `font-medium ${tone}`}`}>{value}</span></div>;
}
