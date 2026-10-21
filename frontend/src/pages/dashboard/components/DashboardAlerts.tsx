import { ArrowRight, TriangleAlert } from "lucide-react";

interface DashboardAlertsProps {
  arrivals: number;
  pendingOrders: number;
  urgentRepairs: number;
  overdue: number;
  onReservations: () => void;
  onRoomService: () => void;
  onHousekeeping: () => void;
  onStays: () => void;
}

const alertButton = "min-h-11 rounded px-2 text-left font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40";

export default function DashboardAlerts({ arrivals, pendingOrders, urgentRepairs, overdue, onReservations, onRoomService, onHousekeeping, onStays }: DashboardAlertsProps) {
  if (!arrivals && !pendingOrders && !urgentRepairs && !overdue) return null;
  return <section aria-label="Operational alerts" role="status" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-sm text-amber-950 shadow-panel">
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 rounded-lg bg-amber-100/80 px-2.5 py-1 text-[11px] font-bold text-amber-900"><TriangleAlert size={14} className="text-amber-700" />Attention</span>
      {overdue > 0 && <button type="button" onClick={onStays} className={`${alertButton} font-semibold text-rose-800`}>{overdue} {overdue === 1 ? "room is" : "rooms are"} past check-out</button>}
      {arrivals > 0 && <button type="button" onClick={onReservations} className={alertButton}>{arrivals} {arrivals === 1 ? "booking" : "bookings"} arriving today</button>}
      {pendingOrders > 0 && <button type="button" onClick={onRoomService} className={alertButton}>{pendingOrders} {pendingOrders === 1 ? "order" : "orders"} in preparation</button>}
      {urgentRepairs > 0 && <button type="button" onClick={onHousekeeping} className={`${alertButton} font-semibold text-rose-800`}>{urgentRepairs} urgent {urgentRepairs === 1 ? "repair" : "repairs"}</button>}
    </div>
    <button type="button" onClick={onStays} className="inline-flex min-h-11 items-center gap-1 rounded px-2 text-xs font-semibold text-slate-700 hover:text-slate-900">Open stays <ArrowRight size={14} /></button>
  </section>;
}
