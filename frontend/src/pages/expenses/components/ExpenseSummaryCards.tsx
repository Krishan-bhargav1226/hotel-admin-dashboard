import { MdAccountBalanceWallet, MdPayments, MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { formatCurrency } from "../../../utils/helper/helper";
import type { ExpenseStats, ExpenseTimeRange } from "./ExpenseDashboard";

export default function ExpenseSummaryCards({ timeRange, stats }: { timeRange: ExpenseTimeRange; stats: ExpenseStats }) {
  return <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
    <SummaryCard title={`Total Outflow (${timeRange})`} value={formatCurrency(stats.totalOutflow)} note={<>Today: <strong className="text-slate-700">{formatCurrency(stats.todayExpenses)}</strong></>} icon={<MdTrendingDown size={18} />} tone="rose" />
    <SummaryCard title={`Collections Inflow (${timeRange})`} value={formatCurrency(stats.rangeInflow)} note="From stays & room advances" icon={<MdTrendingUp size={18} />} tone="emerald" />
    <SummaryCard title="Net Operating Cash" value={`${stats.netOperatingCash >= 0 ? "+" : ""}${formatCurrency(stats.netOperatingCash)}`} note="Operating surplus / cash flow" icon={<MdPayments size={18} />} tone={stats.netOperatingCash >= 0 ? "brand" : "amber"} />
    <section className="relative overflow-hidden rounded-2xl border border-brand-200/90 bg-gradient-to-br from-brand-50/70 via-white to-white p-5 shadow-card dark:from-brand-900/30 dark:via-[var(--card)] dark:to-[var(--card)]"><div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Physical Cash In Drawer</span><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs"><MdAccountBalanceWallet size={18} /></span></div><p className="mt-2 font-mono text-2xl font-bold text-slate-900">{formatCurrency(stats.physicalCashInHand)}</p><div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500"><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" /><span>Safe Float: ₹5,000 · Verified</span></div></section>
  </div>;
}

function SummaryCard({ title, value, note, icon, tone }: { title: string; value: string; note: React.ReactNode; icon: React.ReactNode; tone: "rose" | "emerald" | "brand" | "amber" }) {
  const colors = { rose: "text-rose-600 bg-rose-50", emerald: "text-emerald-600 bg-emerald-50", brand: "text-brand-600 bg-brand-50", amber: "text-amber-600 bg-amber-50" };
  const valueTone = { rose: "text-rose-600", emerald: "text-emerald-600", brand: "text-brand-700", amber: "text-amber-600" };
  return <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card"><div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[tone]}`}>{icon}</span></div><p className={`mt-2 font-mono text-2xl font-bold ${valueTone[tone]}`}>{value}</p><span className="mt-1 block text-xs text-slate-400">{note}</span></section>;
}
