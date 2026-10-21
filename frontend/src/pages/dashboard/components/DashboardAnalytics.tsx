import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import { revenueByDay, revenueByPlan, toRange } from "../../../utils/helper/analytics";
import type { Stay } from "../../../utils/interfaces/Interface";

const PIE_COLORS = ["#E97252", "#DDA079", "#8FA6A3", "#B8A798", "#87A58D", "#C48F94"];

export default function DashboardAnalytics({ stays }: { stays: Stay[] }) {
  const recentStays = stays.filter((stay) => stay.status === "COMPLETED" && dayjs(stay.checkOutAt).isAfter(dayjs().subtract(30, "day")));
  const week = toRange(dayjs().subtract(6, "day").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD"));
  const daySeries = revenueByDay(stays, week);
  const planSeries = revenueByPlan(recentStays);

  return <div className="mb-6 grid gap-4 lg:grid-cols-3">
    <SectionBox className="min-w-0 lg:col-span-2">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div><Typography variant="h6" fontWeight={750} className="leading-tight tracking-tight text-slate-900">7-Day Revenue Trend</Typography><Typography variant="caption" className="font-medium text-slate-500">Daily settled checkout receipts & room earnings</Typography></div><span className="rounded-full bg-brand-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-brand-700">Settled folios</span></div>
      <Box sx={{ height: 230 }} className="pt-2"><ResponsiveContainer><BarChart data={daySeries}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--border)" /><XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted)" /><YAxis tickLine={false} axisLine={false} fontSize={12} width={55} stroke="var(--muted)" /><Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} contentStyle={tooltipStyle} /><Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[7, 7, 2, 2]} maxBarSize={38} /></BarChart></ResponsiveContainer></Box>
    </SectionBox>
    <SectionBox className="min-w-0">
      <Typography variant="h6" fontWeight={750} className="leading-tight tracking-tight text-slate-900">Stay plan mix</Typography><Typography variant="caption" className="mb-2 block font-medium text-slate-500">30-day guest stay plan distribution</Typography>
      {planSeries.length === 0 ? <Typography variant="body2" className="py-10 text-center text-slate-400">No completed stays data yet</Typography> : <Box sx={{ height: 210 }}><ResponsiveContainer><PieChart><Pie data={planSeries} dataKey="revenue" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={4}>{planSeries.map((_plan, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => [formatCurrency(value), "Total"]} contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></Box>}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-1 text-xs">{planSeries.map((plan, index) => <span key={plan.name} className="flex items-center gap-1.5 font-medium text-slate-700"><i className="inline-block h-2 w-2 rounded-full" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />{plan.name}</span>)}</div>
    </SectionBox>
  </div>;
}

const tooltipStyle = { borderRadius: "14px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)", boxShadow: "0 8px 24px rgba(39, 29, 25, 0.12)" };
