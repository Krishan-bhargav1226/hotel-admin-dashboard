import { useState, useMemo } from "react";
import { BarChart3, Printer } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

interface ChainConsolidatedReportsProps {
  properties: HotelProperty[];
}

export default function ChainConsolidatedReports({ properties }: ChainConsolidatedReportsProps) {
  const [activeTab, setActiveTab] = useState<"REVENUE" | "BENCHMARK" | "TAX">("REVENUE");

  const totalChainRev = useMemo(() => {
    return properties.reduce((sum, p) => sum + (p.dailyRevenue || 0), 0);
  }, [properties]);

  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => (b.dailyRevenue || 0) - (a.dailyRevenue || 0));
  }, [properties]);

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chain-wide Consolidated Reports & Financial Schedules
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-property analytics — no hotel selection required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab("REVENUE")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                activeTab === "REVENUE"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Revenue Distribution
            </button>
            <button
              onClick={() => setActiveTab("BENCHMARK")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                activeTab === "BENCHMARK"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Occupancy Benchmark
            </button>
            <button
              onClick={() => setActiveTab("TAX")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                activeTab === "TAX"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              GST Schedule
            </button>
          </div>

          <Button size="sm" variant="outline" icon={Printer} onClick={handlePrintAudit} className="h-7.5 text-xs">
            Print Chain Audit
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "REVENUE" && (
          <div className="space-y-3">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Total Combined Chain Daily Revenue:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                ₹{totalChainRev.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-2.5">
              {sortedProperties.map((p, idx) => {
                const share = totalChainRev > 0 ? ((p.dailyRevenue || 0) / totalChainRev) * 100 : 0;
                return (
                  <div key={p.id} className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                        <span className="text-[11px] text-slate-400">({p.location.split(",")[0]})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{(p.dailyRevenue || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] text-slate-500">({share.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-brand-600 dark:bg-brand-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "BENCHMARK" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Hotel Property</th>
                  <th className="pb-2 text-center">Keys</th>
                  <th className="pb-2 text-center">Occupancy</th>
                  <th className="pb-2 text-right">ADR</th>
                  <th className="pb-2 text-right">RevPAR</th>
                  <th className="pb-2 text-right">Daily Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedProperties.map((p, index) => {
                  const revPar = Math.round(((p.occupancyRate || 0) / 100) * (p.adr || 0));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.location}</div>
                      </td>
                      <td className="py-2.5 text-center font-mono">{p.roomCount}</td>
                      <td className="py-2.5 text-center">
                        <span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {p.occupancyRate}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono">₹{p.adr}</td>
                      <td className="py-2.5 text-right font-mono font-medium text-purple-700 dark:text-purple-300">
                        ₹{revPar}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(p.dailyRevenue || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "TAX" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-2">Hotel Entity</th>
                  <th className="pb-2">GSTIN Number</th>
                  <th className="pb-2 text-right">Room GST (12%)</th>
                  <th className="pb-2 text-right">F&B GST (5%)</th>
                  <th className="pb-2 text-right">Total GST Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {properties.map((p) => {
                  const rev = p.dailyRevenue || 0;
                  const roomGst = Math.round(rev * 0.85 * 0.12);
                  const fbGst = Math.round(rev * 0.15 * 0.05);
                  const totalGst = roomGst + fbGst;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">{p.gstin}</td>
                      <td className="py-2.5 text-right font-mono">₹{roomGst.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right font-mono">₹{fbGst.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{totalGst.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
