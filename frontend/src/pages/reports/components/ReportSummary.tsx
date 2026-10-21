import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../utils/helper/helper";

interface ReportSummaryProps {
  profit: number;
  margin: number;
  revenue: number;
  expenses: number;
  from: string;
  to: string;
  revenueDelta?: number;
  profitDelta?: number;
}

export default function ReportSummary({
  profit,
  margin,
  revenue,
  expenses,
  from,
  to,
  revenueDelta,
  profitDelta,
}: ReportSummaryProps) {
  return (
    <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50/70 p-5 shadow-panel dark:border-brand-700 dark:bg-brand-900/25">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-semibold text-brand-800 dark:text-brand-200">
            Profit and loss summary & comparison
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl flex items-center gap-2">
            Net operating profit{" "}
            <span className={profit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
              {formatCurrency(profit)}
            </span>
            {profitDelta !== undefined && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  profitDelta >= 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                {profitDelta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {profitDelta >= 0 ? `+${profitDelta}%` : `${profitDelta}%`}
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Operating margin: <strong>{margin}%</strong> · {from} to {to}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SummaryAmount
            label="Total revenue"
            value={revenue}
            tone="text-emerald-700 dark:text-emerald-300"
            delta={revenueDelta}
          />
          <SummaryAmount
            label="Total expenses"
            value={expenses}
            tone="text-rose-700 dark:text-rose-300"
          />
        </div>
      </div>
    </div>
  );
}

function SummaryAmount({
  label,
  value,
  tone,
  delta,
}: {
  label: string;
  value: number;
  tone: string;
  delta?: number;
}) {
  return (
    <div className="min-w-36 rounded-xl border border-brand-100 bg-white/80 px-4 py-2.5 dark:border-brand-800 dark:bg-[var(--background)]">
      <div className="flex items-center justify-between gap-2">
        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        {delta !== undefined && (
          <span
            className={`text-[10px] font-bold ${
              delta >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </span>
        )}
      </div>
      <span className={`font-mono text-base font-bold ${tone}`}>{formatCurrency(value)}</span>
    </div>
  );
}
