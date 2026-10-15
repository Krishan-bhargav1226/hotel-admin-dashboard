import { Box, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { collectionByMode, revenueByDay } from "../../../utils/helper/analytics";

const COLORS = ["#356B4F", "#B8792E", "#557D8A", "#5B8A69", "#8A6D73", "#9B6D73"];
const tooltipStyle = { borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)", boxShadow: "0 8px 24px rgba(18, 42, 27, 0.12)" };

interface RevenueAnalyticsProps {
  daily: ReturnType<typeof revenueByDay>;
  modes: ReturnType<typeof collectionByMode>;
}

export default function RevenueAnalytics({ daily, modes: allModes }: RevenueAnalyticsProps) {
  const modes = allModes.filter((mode) => mode.value > 0);
  return <Box className="mb-4 grid gap-4 lg:grid-cols-3">
    <SectionBox className="rounded-xl bg-white shadow-xs lg:col-span-2">
      <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">Daily Revenue Breakdown (₹)</Typography>
      <Box sx={{ height: 260 }}><ResponsiveContainer><BarChart data={daily}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="date" tickLine={false} fontSize={12} stroke="var(--muted)" interval="preserveStartEnd" /><YAxis tickLine={false} axisLine={false} fontSize={12} width={55} stroke="var(--muted)" /><Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} contentStyle={tooltipStyle} /><Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></Box>
    </SectionBox>
    <SectionBox className="rounded-xl bg-white shadow-xs">
      <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">Payment Mode Collection</Typography>
      {modes.length === 0 ? <Typography variant="body2" className="py-10 text-center text-gray-400">No payment collection recorded in this date range</Typography> : <Box sx={{ height: 260 }}><ResponsiveContainer><PieChart><Pie data={modes} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}>{modes.map((_mode, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value: number) => [formatCurrency(value), "Collected"]} contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer></Box>}
    </SectionBox>
  </Box>;
}
