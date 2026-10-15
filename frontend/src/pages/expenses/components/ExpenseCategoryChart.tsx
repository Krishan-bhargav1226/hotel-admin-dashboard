import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { CategoryPoint, ExpenseStats } from "./ExpenseDashboard";

interface ExpenseCategoryChartProps {
  data: CategoryPoint[];
  total: ExpenseStats["totalOutflow"];
  selected: string;
  onSelect: (category: string) => void;
}

export default function ExpenseCategoryChart({ data, total, selected, onSelect }: ExpenseCategoryChartProps) {
  return <SectionBox className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white !p-5 shadow-card">
    <div>
      <div className="mb-3 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">Category Breakdown</h3><p className="mt-0.5 text-xs text-slate-500">Expenditure share by hotel department</p></div>
      <div className="relative flex h-52 w-full items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatCurrency(Number(value)), String(name)]} /><Pie data={data} innerRadius={62} outerRadius={88} paddingAngle={3} dataKey="value">{data.map((entry) => <Cell key={entry.key} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-[10px] font-semibold uppercase text-slate-400">Total Spent</span><span className="font-mono text-base font-bold text-slate-900">{formatCurrency(total)}</span></div></div>
    </div>
    <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">{data.map((category) => <button key={category.key} type="button" aria-pressed={selected === category.key} onClick={() => onSelect(category.key === selected ? "ALL" : category.key)} className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${selected === category.key ? "border border-brand-200 bg-brand-50 font-bold" : "hover:bg-slate-50"}`}><span className="flex min-w-0 items-center gap-2 truncate"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} /><span className="truncate text-slate-700">{category.name}</span></span><span className="flex shrink-0 items-center gap-2"><span className="font-mono font-semibold text-slate-900">{formatCurrency(category.value)}</span><span className="text-[10px] font-bold text-slate-400">({category.percentage}%)</span></span></button>)}</div>
  </SectionBox>;
}

const tooltipStyle = { backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "10px", color: "var(--foreground)", fontSize: "12px" };
