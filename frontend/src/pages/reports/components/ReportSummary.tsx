import { Box } from "@mui/material";
import { formatCurrency } from "../../../utils/helper/helper";

export default function ReportSummary({ profit, margin, revenue, expenses, from, to }: { profit: number; margin: number; revenue: number; expenses: number; from: string; to: string }) {
  return <Box className="mb-4 rounded-2xl border border-brand-200 bg-brand-50/70 p-5 shadow-panel dark:border-brand-700 dark:bg-brand-900/25">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div><span className="text-xs font-semibold text-brand-800 dark:text-brand-200">Profit and loss summary</span><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">Net operating profit <span className={profit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>{formatCurrency(profit)}</span></h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Operating margin: <strong>{margin}%</strong> · {from} to {to}</p></div>
      <div className="flex flex-wrap items-center gap-2"><SummaryAmount label="Total revenue" value={revenue} tone="text-emerald-700 dark:text-emerald-300" /><SummaryAmount label="Total expenses" value={expenses} tone="text-rose-700 dark:text-rose-300" /></div>
    </div>
  </Box>;
}

function SummaryAmount({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="min-w-36 rounded-xl border border-brand-100 bg-white/80 px-4 py-2.5 dark:border-brand-800 dark:bg-[var(--background)]"><span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</span><span className={`font-mono text-base font-bold ${tone}`}>{formatCurrency(value)}</span></div>;
}
