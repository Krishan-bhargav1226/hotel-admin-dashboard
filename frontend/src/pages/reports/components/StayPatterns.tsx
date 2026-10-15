import { Box, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { peakCheckInHours, revenueByPlan } from "../../../utils/helper/analytics";

interface StayPatternsProps { hours: ReturnType<typeof peakCheckInHours>; plans: ReturnType<typeof revenueByPlan>; roomRevenue: number; }

export default function StayPatterns({ hours, plans, roomRevenue }: StayPatternsProps) {
  return <Box className="mb-4 grid gap-4 lg:grid-cols-2">
    <SectionBox className="rounded-xl bg-white shadow-xs"><Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">Peak Guest Check-In Arrival Hours</Typography><Box sx={{ height: 220 }}><ResponsiveContainer><BarChart data={hours}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="hour" tickLine={false} fontSize={11} interval={2} stroke="var(--muted)" /><YAxis tickLine={false} axisLine={false} fontSize={12} width={28} allowDecimals={false} stroke="var(--muted)" /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Arrivals" fill="#B8792E" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Box></SectionBox>
    <SectionBox className="rounded-xl bg-white shadow-xs"><Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">Rate Plan Revenue Share</Typography>{plans.length === 0 ? <Typography variant="body2" className="py-10 text-center text-gray-400">No data</Typography> : plans.map((plan) => <Box key={plan.name} className="mb-3"><Box className="flex justify-between text-xs font-semibold"><span>{plan.name}</span><span>{formatCurrency(plan.revenue)} · {plan.stays} stays</span></Box><Box className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"><Box className="h-2 rounded-full bg-brand-900" sx={{ width: `${roomRevenue ? (plan.revenue / roomRevenue) * 100 : 0}%` }} /></Box></Box>)}</SectionBox>
  </Box>;
}

const tooltipStyle = { borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)", boxShadow: "0 8px 24px rgba(18, 42, 27, 0.12)" };
