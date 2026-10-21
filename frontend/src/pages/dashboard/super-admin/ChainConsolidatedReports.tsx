import { useMemo, useState } from "react";
import { BarChart3, Filter, Printer, Search } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../../../components/ui/button";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

interface ChainConsolidatedReportsProps {
  properties: HotelProperty[];
}

type ReportTab = "REVENUE" | "BENCHMARK" | "TAX";
type SortKey = "REVENUE" | "OCCUPANCY" | "ADR" | "ROOMS";

const chartColors = ["#bf563a", "#d99572", "#78958a", "#a59a84"];
const formatRupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function ChainConsolidatedReports({ properties }: ChainConsolidatedReportsProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>("REVENUE");
  const [propertyId, setPropertyId] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("REVENUE");

  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return properties
      .filter((property) => propertyId === "all" || property.id === propertyId)
      .filter((property) => !normalizedQuery || `${property.name} ${property.location} ${property.brandTier}`.toLowerCase().includes(normalizedQuery))
      .sort((first, second) => {
        const values: Record<SortKey, (property: HotelProperty) => number> = {
          REVENUE: (property) => property.dailyRevenue || 0,
          OCCUPANCY: (property) => property.occupancyRate || 0,
          ADR: (property) => property.adr || 0,
          ROOMS: (property) => property.roomCount || 0,
        };
        return values[sortBy](second) - values[sortBy](first);
      });
  }, [properties, propertyId, query, sortBy]);

  const totalRevenue = filteredProperties.reduce((sum, property) => sum + (property.dailyRevenue || 0), 0);
  const totalRooms = filteredProperties.reduce((sum, property) => sum + (property.roomCount || 0), 0);
  const occupiedRooms = filteredProperties.reduce(
    (sum, property) => sum + (property.roomCount || 0) * (property.occupancyRate || 0) / 100,
    0,
  );
  const occupancy = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const averageRate = totalRooms
    ? Math.round(filteredProperties.reduce((sum, property) => sum + (property.adr || 0) * (property.roomCount || 0), 0) / totalRooms)
    : 0;

  const revenueData = filteredProperties.map((property) => ({
    id: property.id,
    name: property.name,
    chartName: property.name.replace(/^Grand Horizon /, ""),
    revenue: property.dailyRevenue || 0,
    occupancy: property.occupancyRate || 0,
    adr: property.adr || 0,
    rooms: property.roomCount || 0,
  }));

  const handlePrintAudit = () => window.print();

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5" aria-labelledby="chain-reports-title">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <h2 id="chain-reports-title" className="text-sm font-bold text-slate-900 dark:text-white">
              Chain-wide analytics
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Compare hotel revenue, occupancy, and tax schedules from one portfolio view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Chain analytics reports">
          {([
            ["REVENUE", "Revenue"],
            ["BENCHMARK", "Occupancy benchmark"],
            ["TAX", "GST schedule"],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
          <Button size="sm" variant="outline" icon={Printer} onClick={handlePrintAudit} className="ml-1 h-8 text-xs">
            Print audit
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_190px_180px_auto]">
        <label className="relative block">
          <span className="sr-only">Search hotels</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hotel, city, or tier"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900 dark:focus:ring-brand-950"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Filter by hotel</span>
          <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <select
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-brand-950"
          >
            <option value="all">All hotels</option>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Sort hotels by</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-brand-950"
          >
            <option value="REVENUE">Sort: Daily revenue</option>
            <option value="OCCUPANCY">Sort: Occupancy</option>
            <option value="ADR">Sort: Average rate</option>
            <option value="ROOMS">Sort: Room count</option>
          </select>
        </label>

        <div className="flex items-center px-1 text-xs font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
          {filteredProperties.length} of {properties.length} hotels
        </div>
      </div>

      <div className="mt-4">
        {filteredProperties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No hotels match these filters. Clear the search or choose all hotels.
          </div>
        ) : activeTab === "REVENUE" ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(240px,0.8fr)]">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily revenue by hotel</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Current portfolio snapshot · sorted by selected metric</p>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {propertyId === "all" ? "Combined revenue" : "Selected hotel"}
                  </span>
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{formatRupees(totalRevenue)}</span>
                </div>
              </div>
              <div className="mt-4 h-64 w-full" role="img" aria-label="Bar chart comparing daily revenue by hotel">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="var(--border)" />
                    <XAxis dataKey="chartName" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} interval={0} angle={-8} textAnchor="end" height={42} />
                    <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={(value: number) => value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${Math.round(value / 1000)}k`} />
                    <ChartTooltip
                      cursor={{ fill: "rgba(191, 86, 58, 0.06)" }}
                      formatter={(value) => [formatRupees(Number(value)), "Daily revenue"]}
                      labelFormatter={(_label, payload) => payload?.[0]?.payload?.name || _label}
                      contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                    />
                    <Bar dataKey="revenue" name="Daily revenue" radius={[8, 8, 2, 2]} maxBarSize={72}>
                      {revenueData.map((entry, index) => <Cell key={entry.id} fill={chartColors[index % chartColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <aside className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1" aria-label="Filtered portfolio summary">
              <SummaryCard label="Portfolio occupancy" value={`${occupancy}%`} detail={`${Math.round(occupiedRooms)} of ${totalRooms} rooms occupied`} />
              <SummaryCard label="Weighted average rate" value={formatRupees(averageRate)} detail="Room-count weighted ADR" />
              <SummaryCard label="Properties in view" value={`${filteredProperties.length}`} detail={propertyId === "all" ? "Across the hotel chain" : "Filtered portfolio"} />
            </aside>
          </div>
        ) : activeTab === "BENCHMARK" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Occupancy benchmark</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Compare occupied room share across the selected hotels.</p>
                </div>
                <div className="text-right"><span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">Portfolio average</span><span className="text-lg font-bold text-slate-900 dark:text-white">{occupancy}%</span></div>
              </div>
              <div className="mt-4 h-60 w-full" role="img" aria-label="Bar chart comparing hotel occupancy percentages">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="var(--border)" />
                    <XAxis dataKey="chartName" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} interval={0} angle={-8} textAnchor="end" height={42} />
                    <YAxis domain={[0, 100]} unit="%" tickLine={false} axisLine={false} width={44} tick={{ fontSize: 11, fill: "var(--muted)" }} />
                    <ReferenceLine y={occupancy} stroke="#78958a" strokeDasharray="5 5" label={{ value: `Avg. ${occupancy}%`, fill: "#78958a", fontSize: 11 }} />
                    <ChartTooltip formatter={(value) => [`${Number(value)}%`, "Occupancy"]} labelFormatter={(_label, payload) => payload?.[0]?.payload?.name || _label} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
                    <Bar dataKey="occupancy" name="Occupancy" radius={[8, 8, 2, 2]} maxBarSize={72}>
                      {revenueData.map((entry, index) => <Cell key={entry.id} fill={chartColors[index % chartColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full min-w-[660px] text-left text-xs">
                <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                  <tr><th className="px-3 py-2.5">Hotel property</th><th className="px-3 py-2.5 text-center">Keys</th><th className="px-3 py-2.5 text-center">Occupancy</th><th className="px-3 py-2.5 text-right">ADR</th><th className="px-3 py-2.5 text-right">RevPAR</th><th className="px-3 py-2.5 text-right">Daily revenue</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProperties.map((property) => {
                    const revPar = Math.round(((property.occupancyRate || 0) / 100) * (property.adr || 0));
                    return <tr key={property.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30"><td className="px-3 py-3"><div className="font-semibold text-slate-900 dark:text-white">{property.name}</div><div className="mt-0.5 text-[10px] text-slate-400">{property.location}</div></td><td className="px-3 py-3 text-center font-mono">{property.roomCount}</td><td className="px-3 py-3 text-center"><span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{property.occupancyRate}%</span></td><td className="px-3 py-3 text-right font-mono">{formatRupees(property.adr || 0)}</td><td className="px-3 py-3 text-right font-mono">{formatRupees(revPar)}</td><td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{formatRupees(property.dailyRevenue || 0)}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                <tr><th className="px-3 py-2.5">Hotel entity</th><th className="px-3 py-2.5">GSTIN number</th><th className="px-3 py-2.5 text-right">Room GST (12%)</th><th className="px-3 py-2.5 text-right">F&amp;B GST (5%)</th><th className="px-3 py-2.5 text-right">Total GST output</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProperties.map((property) => {
                  const revenue = property.dailyRevenue || 0;
                  const roomGst = Math.round(revenue * 0.85 * 0.12);
                  const foodGst = Math.round(revenue * 0.15 * 0.05);
                  return <tr key={property.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30"><td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">{property.name}</td><td className="px-3 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">{property.gstin}</td><td className="px-3 py-3 text-right font-mono">{formatRupees(roomGst)}</td><td className="px-3 py-3 text-right font-mono">{formatRupees(foodGst)}</td><td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{formatRupees(roomGst + foodGst)}</td></tr>;
                })}
                <tr className="bg-slate-50/70 dark:bg-slate-800/50"><td className="px-3 py-3 font-bold text-slate-900 dark:text-white" colSpan={2}>Selected portfolio total</td><td className="px-3 py-3 text-right font-mono font-bold">{formatRupees(filteredProperties.reduce((sum, property) => sum + Math.round((property.dailyRevenue || 0) * 0.85 * 0.12), 0))}</td><td className="px-3 py-3 text-right font-mono font-bold">{formatRupees(filteredProperties.reduce((sum, property) => sum + Math.round((property.dailyRevenue || 0) * 0.15 * 0.05), 0))}</td><td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">{formatRupees(filteredProperties.reduce((sum, property) => { const revenue = property.dailyRevenue || 0; return sum + Math.round(revenue * 0.85 * 0.12) + Math.round(revenue * 0.15 * 0.05); }, 0))}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  );
}
