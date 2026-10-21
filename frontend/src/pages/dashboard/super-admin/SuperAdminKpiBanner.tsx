import { Building2, BedDouble, IndianRupee, TrendingUp } from "lucide-react";
import { FadeIn } from "../../../lib/motion";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

export default function SuperAdminKpiBanner({ properties }: { properties: HotelProperty[] }) {
  const rooms = properties.reduce((total, property) => total + (property.roomCount || 0), 0);
  const revenue = properties.reduce((total, property) => total + (property.dailyRevenue || 0), 0);
  const occupancy = rooms
    ? Math.round(properties.reduce((total, property) => total + (property.occupancyRate || 0) * (property.roomCount || 0), 0) / rooms)
    : 0;
  const averageRate = properties.length
    ? Math.round(properties.reduce((total, property) => total + (property.adr || 0), 0) / properties.length)
    : 0;

  const cards = [
    { label: "Today's revenue", value: `₹${(revenue / 100000).toFixed(2)}L`, detail: `Across ${properties.length} ${properties.length === 1 ? "property" : "properties"}`, icon: IndianRupee, tone: "text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-950/50" },
    { label: "Occupancy", value: `${occupancy}%`, detail: `${Math.round((rooms * occupancy) / 100)} of ${rooms} rooms occupied`, icon: BedDouble, tone: "text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/50" },
    { label: "Average room rate", value: `₹${averageRate.toLocaleString("en-IN")}`, detail: `₹${Math.round((occupancy / 100) * averageRate).toLocaleString("en-IN")} revenue per available room`, icon: TrendingUp, tone: "text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/50" },
    { label: "Active properties", value: `${properties.filter((property) => property.status !== "INACTIVE").length} / ${properties.length}`, detail: `${rooms} rooms in the portfolio`, icon: Building2, tone: "text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/50" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      {cards.map(({ label, value, detail, icon: Icon, tone }, index) => (
        <FadeIn key={label} delay={index * 0.06} className="h-full">
          <article className="flex h-full min-h-36 flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
              <span className={`flex size-9 items-center justify-center rounded-xl ${tone}`}><Icon className="size-4" aria-hidden="true" /></span>
            </div>
            <div className="mt-5">
              <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p>
            </div>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}
