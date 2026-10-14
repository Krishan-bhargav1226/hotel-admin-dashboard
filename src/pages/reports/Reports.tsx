import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import SectionBox from "../../components/ui/container/SectionBox";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import InBetweenDateSearch, { presetRange, type DateRangeValue } from "../../components/forms/InBetweenDateSearch";
import RenderTable from "../../components/tables/RenderTable";
import { TableRow } from "../../components/tables/TableRow";
import { exportToExcel } from "../../components/print/printExcel/ExportToExcel";
import { printDocument } from "../../components/print/printPdf/PrintDocument";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetExpensesQuery } from "../../store/services/expense/expenseSlice";
import { useGetServiceOrdersQuery } from "../../store/services/pos/posSlice";
import {
  checkInsIn,
  collectionByMode,
  completedIn,
  peakCheckInHours,
  repeatGuestPercent,
  revenueByDay,
  revenueByPlan,
  roomStats,
  toRange,
  topGuests,
} from "../../utils/helper/analytics";
import { formatCurrency, formatDuration } from "../../utils/helper/helper";

const PIE_COLORS = ["#27336B", "#E8A33D", "#2D8FD6", "#1E9E6A", "#8B5CF6", "#EC4899"];

const Kpi = ({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: string;
  note?: string;
  color?: string;
}) => (
  <Box className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
    <Typography variant="caption" className="text-gray-500 font-bold uppercase text-[10px]">
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={900} sx={{ color: color || "#0f172a" }} className="mt-0.5">
      {value}
    </Typography>
    {note && (
      <Typography variant="caption" className="text-gray-400 font-semibold block text-[11px]">
        {note}
      </Typography>
    )}
  </Box>
);

const roomCols = [
  { label: "Room" },
  { label: "Stays" },
  { label: "Occupied Hours" },
  { label: "Occupancy" },
  { label: "Revenue" },
];

export default function Reports() {
  const { data: stays = [] } = useGetStaysQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: expenses = [] } = useGetExpensesQuery();
  const { data: serviceOrders = [] } = useGetServiceOrdersQuery();

  const [range, setRange] = useState<DateRangeValue>(presetRange("thisMonth"));
  const r = useMemo(() => toRange(range.from, range.to), [range]);

  const done = useMemo(() => completedIn(stays, r), [stays, r]);
  const arrivals = useMemo(() => checkInsIn(stays, r), [stays, r]);
  const roomRevenue = done.reduce((s, x) => s + x.totalAmount, 0);

  // F&B direct orders in range
  const posRevenue = serviceOrders
    .filter(
      (o) =>
        !o.billedToRoom &&
        dayjs(o.createdAt).isAfter(dayjs(range.from).startOf("day")) &&
        dayjs(o.createdAt).isBefore(dayjs(range.to).endOf("day"))
    )
    .reduce((s, o) => s + o.totalAmount, 0);

  const totalGrossRevenue = roomRevenue + posRevenue;

  // Expenses in range
  const rangeExpenses = expenses
    .filter((e) => e.date >= range.from && e.date <= range.to)
    .reduce((s, e) => s + e.amount, 0);

  const netProfit = totalGrossRevenue - rangeExpenses;
  const profitMargin = totalGrossRevenue > 0 ? Math.round((netProfit / totalGrossRevenue) * 100) : 0;

  const avgMinutes = done.length
    ? done.reduce((s, x) => s + (x.bill?.elapsedMinutes ?? 0), 0) / done.length
    : 0;

  const daily = revenueByDay(stays, r);
  const plans = revenueByPlan(done);
  const modes = collectionByMode(done).filter((m) => m.value > 0);
  const hours = peakCheckInHours(arrivals);
  const perRoom = roomStats(done, rooms, r);
  const guests = topGuests(done);
  const avgOcc = perRoom.length
    ? Math.round(perRoom.reduce((s, x) => s + x.occupancy, 0) / perRoom.length)
    : 0;

  const roomRows = perRoom.map((x) => ({
    room: x.roomNumber,
    stays: x.stays,
    occupiedHours: x.occupiedHours,
    occupancy: `${x.occupancy}%`,
    revenue: x.revenue,
  }));

  return (
    <MainContainer>
      <PageTitle
        title="Reports, Analytics & Profit & Loss"
        subtitle="Comprehensive hotel revenue, operational costs, occupancy and guest intelligence"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <InBetweenDateSearch value={range} onChange={setRange} />
            <UISubmitButton
              type="button"
              variant="outlined"
              text="Print P&L"
              onClick={() => printDocument(roomRows, roomCols, "Hotel Room & Revenue Report")}
            />
            <UISubmitButton
              type="button"
              color="success"
              text="Export Excel"
              onClick={() => exportToExcel(roomRows, roomCols, "Hotel-Financial-Report.xlsx")}
            />
          </div>
        }
      />

      {/* Hotel Profit & Loss Highlight Card */}
      <Box className="mb-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Executive Hotel Financial Statement
            </span>
            <h2 className="text-2xl font-black mt-1">
              Net Operating Profit:{" "}
              <span className={netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {formatCurrency(netProfit)}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Operating Profit Margin: <strong>{profitMargin}%</strong> · Date Range: {range.from} to {range.to}
            </p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 uppercase font-semibold block">Total Revenue</span>
              <span className="text-lg font-black text-emerald-300">{formatCurrency(totalGrossRevenue)}</span>
            </div>
            <div className="text-xl font-bold text-slate-400">-</div>
            <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 uppercase font-semibold block">Total Expenses</span>
              <span className="text-lg font-black text-rose-300">{formatCurrency(rangeExpenses)}</span>
            </div>
          </div>
        </div>
      </Box>

      {/* KPI Stats Ribbon */}
      <Box className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Room Revenue" value={formatCurrency(roomRevenue)} note={`${done.length} settled stays`} color="#27336B" />
        <Kpi label="Total Check-Ins" value={String(arrivals.length)} note="Arrivals in range" />
        <Kpi label="Average Folio Bill" value={formatCurrency(done.length ? roomRevenue / done.length : 0)} />
        <Kpi label="Average Stay Duration" value={formatDuration(avgMinutes)} />
        <Kpi label="Guest Retention" value={`${repeatGuestPercent(stays, arrivals)}%`} note="Repeat guests" />
        <Kpi label="Avg Occupancy Rate" value={`${avgOcc}%`} note="Across all rooms" color="#10B981" />
      </Box>

      {/* Revenue by Day & Payment Mode Breakdown */}
      <Box className="mb-4 grid gap-4 lg:grid-cols-3">
        <SectionBox className="lg:col-span-2 bg-white shadow-xs rounded-xl">
          <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">
            Daily Revenue Breakdown (₹)
          </Typography>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} fontSize={12} stroke="#64748b" interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={55} stroke="#64748b" />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#27336B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionBox>

        <SectionBox className="bg-white shadow-xs rounded-xl">
          <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">
            Payment Mode Collection
          </Typography>
          {modes.length === 0 ? (
            <Typography variant="body2" className="py-10 text-center text-gray-400">
              No payment collection recorded in this date range
            </Typography>
          ) : (
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={modes}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    label={(e) => `${e.name}: ${formatCurrency(e.value)}`}
                  >
                    {modes.map((_m, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), "Collected"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </SectionBox>
      </Box>

      {/* Peak Arrival Hours & Rate Plan Mix */}
      <Box className="mb-4 grid gap-4 lg:grid-cols-2">
        <SectionBox className="bg-white shadow-xs rounded-xl">
          <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">
            Peak Guest Check-In Arrival Hours
          </Typography>
          <Box sx={{ height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={hours}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tickLine={false} fontSize={11} interval={2} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} allowDecimals={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" name="Arrivals" fill="#E8A33D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionBox>

        <SectionBox className="bg-white shadow-xs rounded-xl">
          <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">
            Rate Plan Revenue Share
          </Typography>
          {plans.length === 0 ? (
            <Typography variant="body2" className="py-10 text-center text-gray-400">No data</Typography>
          ) : (
            plans.map((p) => (
              <Box key={p.name} className="mb-3">
                <Box className="flex justify-between text-xs font-semibold">
                  <span>{p.name}</span>
                  <span>{formatCurrency(p.revenue)} · {p.stays} stays</span>
                </Box>
                <Box className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <Box
                    className="h-2 rounded-full bg-indigo-900"
                    sx={{ width: `${roomRevenue ? (p.revenue / roomRevenue) * 100 : 0}%` }}
                  />
                </Box>
              </Box>
            ))
          )}
        </SectionBox>
      </Box>

      {/* Room-wise Performance & VIP Guests */}
      <Box className="grid gap-4 lg:grid-cols-3">
        <Box className="lg:col-span-2">
          <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">
            Individual Room Financial Performance
          </Typography>
          <RenderTable columns={roomCols}>
            {perRoom.length === 0 ? (
              <TableRow itemIndex={1}>
                <td className="p-4 text-center text-gray-500" colSpan={roomCols.length}>
                  No Data Found
                </td>
              </TableRow>
            ) : (
              [...perRoom]
                .sort((a, b) => b.revenue - a.revenue)
                .map((x, i) => (
                  <TableRow key={x.roomNumber} itemIndex={i}>
                    <td className="p-3 font-bold text-indigo-950">Room {x.roomNumber}</td>
                    <td className="p-3 text-sm">{x.stays} stays</td>
                    <td className="p-3 text-sm">{x.occupiedHours} hrs</td>
                    <td className="p-3 text-sm font-semibold">{x.occupancy}%</td>
                    <td className="p-3 text-sm font-black text-emerald-700">{formatCurrency(x.revenue)}</td>
                  </TableRow>
                ))
            )}
          </RenderTable>
        </Box>

        <SectionBox className="bg-white shadow-xs rounded-xl">
          <Typography variant="h6" fontWeight={800} className="mb-2 text-slate-900">
            Top High-Value Guests (CRM)
          </Typography>
          {guests.length === 0 ? (
            <Typography variant="body2" className="py-6 text-center text-gray-400">No data</Typography>
          ) : (
            guests.map((g) => (
              <Box key={g.phone} className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0">
                <Box>
                  <Typography variant="body2" fontWeight={800} className="text-slate-900">
                    {g.name}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {g.phone} · {g.visits} stays
                  </Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight={900} className="text-indigo-900">
                  {formatCurrency(g.spent)}
                </Typography>
              </Box>
            ))
          )}
        </SectionBox>
      </Box>
    </MainContainer>
  );
}
