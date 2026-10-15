import { formatCurrency } from "../../../utils/helper/helper";

interface ReservationStats {
  total: number;
  confirmed: number;
  checkedIn: number;
  advanceSum: number;
}

export default function ReservationSummary({ stats }: { stats: ReservationStats }) {
  const metrics = [
    { label: "Total bookings", value: String(stats.total), tone: "text-brand-700" },
    { label: "Confirmed", value: String(stats.confirmed), tone: "text-sky-700" },
    { label: "Checked in", value: String(stats.checkedIn), tone: "text-emerald-700" },
    { label: "Advance collected", value: formatCurrency(stats.advanceSum), tone: "text-amber-700" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map((metric) => (
        <section key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{metric.label}</p>
          <p className={`mt-2 font-mono text-2xl font-semibold tracking-tight ${metric.tone}`}>{metric.value}</p>
        </section>
      ))}
    </div>
  );
}
