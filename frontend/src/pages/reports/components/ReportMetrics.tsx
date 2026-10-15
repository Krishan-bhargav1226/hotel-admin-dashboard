import { Box, Typography } from "@mui/material";
import { formatCurrency, formatDuration } from "../../../utils/helper/helper";

interface ReportMetricsProps { roomRevenue: number; settledStays: number; checkIns: number; averageBill: number; averageDuration: number; retention: number; occupancy: number; }

export default function ReportMetrics({ roomRevenue, settledStays, checkIns, averageBill, averageDuration, retention, occupancy }: ReportMetricsProps) {
  const metrics = [
    { label: "Room revenue", value: formatCurrency(roomRevenue), note: `${settledStays} settled stays`, color: "#356B4F" },
    { label: "Total Check-Ins", value: String(checkIns), note: "Arrivals in range" },
    { label: "Average Folio Bill", value: formatCurrency(averageBill) },
    { label: "Average Stay Duration", value: formatDuration(averageDuration) },
    { label: "Guest Retention", value: `${retention}%`, note: "Repeat guests" },
    { label: "Average occupancy", value: `${occupancy}%`, note: "Across all rooms", color: "#2F7A55" },
  ];
  return <Box className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{metrics.map((item) => <Box key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-panel"><Typography variant="caption" className="text-[10px] font-bold uppercase text-gray-500">{item.label}</Typography><Typography variant="h5" fontWeight={800} sx={{ color: item.color || "var(--foreground)" }} className="mt-1">{item.value}</Typography>{item.note && <Typography variant="caption" className="block text-[11px] font-semibold text-gray-400">{item.note}</Typography>}</Box>)}</Box>;
}
