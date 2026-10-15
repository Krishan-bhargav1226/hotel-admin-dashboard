import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { PaymentModePoint, VendorPoint } from "./ExpenseDashboard";

export default function PaymentVendorCharts({ payments, vendors }: { payments: PaymentModePoint[]; vendors: VendorPoint[] }) {
  return <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
    <SectionBox className="rounded-2xl border border-slate-200/90 bg-white !p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2"><div><h3 className="text-base font-bold text-slate-900">Payment Modes & Petty Cash Split</h3><p className="mt-0.5 text-xs text-slate-500">Collections vs Disbursements by payment channel</p></div><div className="flex items-center gap-3 text-xs font-semibold"><Legend tone="text-emerald-700" color="bg-emerald-500">Collections</Legend><Legend tone="text-rose-600" color="bg-rose-500">Expenses</Legend></div></div>
      <div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={payments} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="mode" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} tickFormatter={compactRupees} /><Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatCurrency(Number(value)), String(name)]} /><Bar dataKey="Collections" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={38} /><Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={38} /></BarChart></ResponsiveContainer></div>
    </SectionBox>
    <SectionBox className="rounded-2xl border border-slate-200/90 bg-white !p-5 shadow-card">
      <div className="mb-4 border-b border-slate-100 pb-2"><h3 className="text-base font-bold text-slate-900">Top Payees & Vendor Concentration</h3><p className="mt-0.5 text-xs text-slate-500">Highest operational payouts and recurring bills</p></div>
      <div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={vendors} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} /><XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} tickFormatter={compactRupees} /><YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--foreground)", fontWeight: 600 }} tickLine={false} axisLine={false} width={140} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), "Total Paid"]} /><Bar dataKey="amount" fill="var(--primary)" radius={[0, 4, 4, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer></div>
    </SectionBox>
  </div>;
}

function Legend({ tone, color, children }: { tone: string; color: string; children: React.ReactNode }) {
  return <span className={`flex items-center gap-1.5 ${tone}`}><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{children}</span>;
}
const compactRupees = (value: number) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`;
const tooltipStyle = { backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "10px", color: "var(--foreground)", fontSize: "12px" };
