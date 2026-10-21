import { AlertTriangle, CheckCircle2 } from "lucide-react";
import SectionBox from "../../../components/ui/container/SectionBox";

interface AuditChecklistProps {
  pendingDepartures: number;
  pendingArrivals: number;
  openPosOrders: number;
  dirtyRoomsCount: number;
}

export function AuditChecklist({
  pendingDepartures,
  pendingArrivals,
  openPosOrders,
  dirtyRoomsCount,
}: AuditChecklistProps) {
  const items = [
    {
      title: "Pending Overdue Departures",
      count: pendingDepartures,
      ok: pendingDepartures === 0,
      help: pendingDepartures === 0 ? "All expected checkouts cleared" : `${pendingDepartures} rooms overdue for folio settlement`,
    },
    {
      title: "Pending Expected Arrivals",
      count: pendingArrivals,
      ok: pendingArrivals === 0,
      help: pendingArrivals === 0 ? "No remaining arrivals due today" : `${pendingArrivals} reservations need check-in or no-show flag`,
    },
    {
      title: "Unsettled POS Restaurant Orders",
      count: openPosOrders,
      ok: openPosOrders === 0,
      help: openPosOrders === 0 ? "All kitchen tickets billed & closed" : `${openPosOrders} kitchen orders still in progress`,
    },
    {
      title: "Rooms in Housekeeping Dirty State",
      count: dirtyRoomsCount,
      ok: dirtyRoomsCount === 0,
      help: dirtyRoomsCount === 0 ? "All room statuses reconciled" : `${dirtyRoomsCount} rooms flagged for night inspection`,
    },
  ];

  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Operational Pre-Audit Validation Checklist
        </h3>
        <p className="text-xs text-slate-500">
          Verify all front office transactions, open folios, and pending cashier slips before executing EOD rollover.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((it, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
              it.ok
                ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20"
                : "border-amber-200 bg-amber-50/50 dark:border-amber-950 dark:bg-amber-950/20"
            }`}
          >
            {it.ok ? (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{it.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                    it.ok
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                  }`}
                >
                  {it.count}
                </span>
              </div>
              <p className="mt-1 text-slate-500 dark:text-slate-400">{it.help}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionBox>
  );
}
