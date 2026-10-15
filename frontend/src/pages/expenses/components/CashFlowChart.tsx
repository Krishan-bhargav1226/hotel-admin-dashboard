import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { CashFlowPoint } from "./ExpenseDashboard";

export default function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return <SectionBox className="rounded-2xl border border-slate-200/90 bg-white !p-5 shadow-card lg:col-span-2">
    <div className="mb-4 flex flex-col justify-between border-b border-slate-100 pb-3 sm:flex-row sm:items-center"><div><h3 className="text-base font-bold text-slate-900">Cash Flow Dynamics & Operating Velocity</h3><p className="mt-0.5 text-xs text-slate-500">Daily guest collections vs operational expenditure with net curve</p></div><div className="mt-2 flex items-center gap-3 text-xs font-semibold sm:mt-0"><Legend tone="text-emerald-700" color="bg-emerald-500">Inflow (Guest Revenue)</Legend><Legend tone="text-rose-600" color="bg-rose-500">Outflow (Expenses)</Legend></div></div>
    <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}><defs><linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient><linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} /><stop offset="95%" stopColor="#F43F5E" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} tickFormatter={compactRupees} /><Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatCurrency(Number(value)), String(name)]} /><Area type="monotone" dataKey="Inflow" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInflow)" /><Area type="monotone" dataKey="Outflow" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutflow)" /></AreaChart></ResponsiveContainer></div>
  </SectionBox>;
}

function Legend({ tone, color, children }: { tone: string; color: string; children: React.ReactNode }) {
  return <span className={`flex items-center gap-1.5 ${tone}`}><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{children}</span>;
}
const compactRupees = (value: number) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`;
const tooltipStyle = { backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", color: "var(--foreground)", fontSize: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)" };
