import { ArrowRight, TriangleAlert } from "lucide-react";

interface DashboardAlertsProps {
  arrivals: number;
  pendingOrders: number;
  urgentRepairs: number;
  onReservations: () => void;
  onRoomService: () => void;
  onHousekeeping: () => void;
}

export default function DashboardAlerts({ arrivals, pendingOrders, urgentRepairs, onReservations, onRoomService, onHousekeeping }: DashboardAlertsProps) {
  if (!arrivals && !pendingOrders && !urgentRepairs) return null;
  return <section aria-label="Operational alerts" role="status" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-sm text-amber-950 shadow-panel">
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-lg bg-amber-100/80 px-2.5 py-1 text-[11px] font-bold text-amber-900"><TriangleAlert size={14} className="text-amber-700" />Attention</span>
      {arrivals > 0 && <button type="button" onClick={onReservations} className="rounded px-1 py-1 text-left font-medium underline-offset-4 hover:underline">{arrivals} {arrivals === 1 ? "booking" : "bookings"} arriving today</button>}
      {pendingOrders > 0 && <button type="button" onClick={onRoomService} className="rounded px-1 py-1 text-left font-medium underline-offset-4 hover:underline">{pendingOrders} {pendingOrders === 1 ? "order" : "orders"} in preparation</button>}
      {urgentRepairs > 0 && <button type="button" onClick={onHousekeeping} className="rounded px-1 py-1 text-left font-semibold text-rose-700 underline-offset-4 hover:underline">{urgentRepairs} urgent {urgentRepairs === 1 ? "maintenance ticket" : "maintenance tickets"}</button>}
    </div>
    <button type="button" onClick={onReservations} className="inline-flex items-center gap-1 rounded px-1 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900">Review all <ArrowRight size={14} /></button>
  </section>;
}
