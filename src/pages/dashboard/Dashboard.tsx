import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
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
import {
  MdLogin,
  MdCalendarMonth,
  MdRoomService,
  MdCleaningServices,
  MdTrendingUp,
  MdBed,
  MdWarning,
  MdAttachMoney,
  MdCheckCircle,
  MdArrowForward,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import SectionBox from "../../components/ui/container/SectionBox";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import RoomTile from "./components/RoomTile";
import CheckoutDialog from "../stays/components/CheckoutDialog";
import { useGetRoomsQuery, useUpdateRoomStatusMutation } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { useGetServiceOrdersQuery } from "../../store/services/pos/posSlice";
import { useGetMaintenanceTicketsQuery } from "../../store/services/housekeeping/housekeepingSlice";
import { useGetSettingsQuery, useLoadDemoDataMutation } from "../../store/services/settings/settingsSlice";
import { useNow } from "../../hooks/useNow";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { formatCurrency, getErrorMessage, buildPath } from "../../utils/helper/helper";
import { calculateBill } from "../../utils/helper/billing";
import { revenueByDay, revenueByPlan, toRange } from "../../utils/helper/analytics";
import type { RoomStatus, Stay } from "../../utils/interfaces/Interface";

const PIE_COLORS = ["#0F172A", "#334155", "#64748B", "#94A3B8", "#059669", "#D97706"];

export default function Dashboard() {
  const navigate = useNavigate();
  const now = useNow(30000);
  const { data: rooms = [], isLoading } = useGetRoomsQuery();
  const { data: roomTypes = [] } = useGetRoomTypesQuery();
  const { data: stays = [] } = useGetStaysQuery();
  const { data: reservations = [] } = useGetReservationsQuery();
  const { data: serviceOrders = [] } = useGetServiceOrdersQuery();
  const { data: maintenanceTickets = [] } = useGetMaintenanceTicketsQuery();
  const { data: settings } = useGetSettingsQuery();
  const [loadDemo, { isLoading: loadingDemo }] = useLoadDemoDataMutation();

  const [updateStatus] = useUpdateRoomStatusMutation();
  const [filter, setFilter] = useState<RoomStatus | "ALL">("ALL");
  const [checkoutStay, setCheckoutStay] = useState<Stay | null>(null);

  const handleLoadDemo = async () => {
    try {
      await loadDemo().unwrap();
      toast.success("Complete hotel management demo data loaded!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const activeByRoom = useMemo(() => {
    const m = new Map<string, Stay>();
    stays.filter((s) => s.status === "ACTIVE").forEach((s) => m.set(s.roomId, s));
    return m;
  }, [stays]);

  const counts = useMemo(() => {
    const c: Record<RoomStatus, number> = { AVAILABLE: 0, OCCUPIED: 0, CLEANING: 0, MAINTENANCE: 0 };
    rooms.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1;
    });
    return c;
  }, [rooms]);

  const todayDone = stays.filter(
    (s) => s.status === "COMPLETED" && s.checkOutAt && dayjs(s.checkOutAt).isSame(dayjs(), "day")
  );
  const todayRevenue = todayDone.reduce((s, x) => s + x.totalAmount, 0);
  const checkInsToday = stays.filter((s) => dayjs(s.checkInAt).isSame(dayjs(), "day")).length;
  const activeStays = stays.filter((s) => s.status === "ACTIVE");

  const runningTotal = activeStays.reduce(
    (sum, s) =>
      sum +
      calculateBill({
        plan: s.plan,
        checkInAt: s.checkInAt,
        checkOutAt: new Date(now).toISOString(),
        expectedCheckOutAt: s.expectedCheckOutAt,
        extraCharges: s.extraCharges,
        discount: s.discount,
        taxPercent: s.taxPercent,
      }).total,
    0
  );

  const pendingDue = stays.reduce((sum, s) => sum + s.dueAmount, 0);
  const occupancy = rooms.length ? Math.round((counts.OCCUPIED / rooms.length) * 100) : 0;

  // Upcoming bookings for today
  const upcomingToday = reservations.filter(
    (r) => r.status === "CONFIRMED" && dayjs(r.checkInDate).isSame(dayjs(), "day")
  );

  // Active F&B orders pending
  const pendingOrders = serviceOrders.filter((o) => o.status === "PREPARING" || o.status === "PENDING");

  // Urgent maintenance
  const urgentRepairs = maintenanceTickets.filter(
    (t) => t.status !== "RESOLVED" && (t.priority === "HIGH" || t.priority === "EMERGENCY")
  );

  const week = toRange(dayjs().subtract(6, "day").format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD"));
  const weekData = revenueByDay(stays, week);
  const planData = revenueByPlan(
    stays.filter((s) => s.status === "COMPLETED" && dayjs(s.checkOutAt).isAfter(dayjs().subtract(30, "day")))
  );

  const floors = useMemo(() => {
    const visible = rooms.filter((r) => filter === "ALL" || r.status === filter);
    const map = new Map<string, typeof rooms>();
    visible.forEach((r) => {
      const key = r.floor || "General Rooms";
      map.set(key, [...(map.get(key) ?? []), r]);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
  }, [rooms, filter]);

  const setStatus = async (id: string, status: RoomStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success("Room status updated");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <MainContainer>
      {/* Editorial Header Section */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-200/70 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-500">
              Live Front Desk Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            {settings?.hotelName || "Grand Horizon Hotel & Suites"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {dayjs(now).format("dddd, DD MMMM YYYY")} · Automated PMS Console
          </p>
        </div>

        {/* Quick Action Ribbon */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(AppEndPoints.RESERVATIONS)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MdCalendarMonth size={15} className="text-slate-500" />
            <span>Advance Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(AppEndPoints.POS_SERVICES)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MdRoomService size={15} className="text-slate-500" />
            <span>Room Service POS</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(AppEndPoints.CHECK_IN)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MdLogin size={15} />
            <span>New Check-In</span>
          </button>
        </div>
      </div>

      {/* Taste-Skill Clean Alerts Banner */}
      {(upcomingToday.length > 0 || pendingOrders.length > 0 || urgentRepairs.length > 0) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3.5 text-xs text-slate-800 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md">
              <MdWarning size={14} className="text-amber-700" />
              Live Alerts
            </span>

            {upcomingToday.length > 0 && (
              <span
                onClick={() => navigate(AppEndPoints.RESERVATIONS)}
                className="cursor-pointer font-medium text-slate-800 hover:text-indigo-950 hover:underline"
              >
                {upcomingToday.length} advance {upcomingToday.length === 1 ? "booking" : "bookings"} arriving today
              </span>
            )}

            {pendingOrders.length > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span
                  onClick={() => navigate(AppEndPoints.POS_SERVICES)}
                  className="cursor-pointer font-medium text-slate-800 hover:text-amber-900 hover:underline"
                >
                  {pendingOrders.length} kitchen {pendingOrders.length === 1 ? "order" : "orders"} in preparation
                </span>
              </>
            )}

            {urgentRepairs.length > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span
                  onClick={() => navigate(AppEndPoints.HOUSEKEEPING)}
                  className="cursor-pointer font-semibold text-rose-700 hover:underline"
                >
                  {urgentRepairs.length} urgent maintenance ticket
                </span>
              </>
            )}
          </div>

          <span
            onClick={() => navigate(AppEndPoints.RESERVATIONS)}
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer text-xs"
          >
            Review all <MdArrowForward size={14} />
          </span>
        </div>
      )}

      {/* Bento KPI Ribbon: Ultra-Clean Minimalist Metric Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* 1. Occupancy */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Occupancy</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <MdBed size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-mono">
            {occupancy}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {counts.OCCUPIED} / {rooms.length} occupied
          </div>
        </div>

        {/* 2. Available Rooms */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Available</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MdCheckCircle size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 mt-1 font-mono">
            {counts.AVAILABLE}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Ready for check-in
          </div>
        </div>

        {/* 3. Today's Revenue */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Today's Revenue</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MdTrendingUp size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-mono">
            {formatCurrency(todayRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {checkInsToday} in · {todayDone.length} out
          </div>
        </div>

        {/* 4. In-House Folios */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Live Folios</span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <MdAttachMoney size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-mono">
            {formatCurrency(runningTotal)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {activeStays.length} active {pendingDue > 0 ? `· ${formatCurrency(pendingDue)} due` : ""}
          </div>
        </div>

        {/* 5. Housekeeping Needed */}
        <div
          onClick={() => navigate(AppEndPoints.HOUSEKEEPING)}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Cleaning</span>
            <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <MdCleaningServices size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-sky-700 mt-1 font-mono">
            {counts.CLEANING}
          </div>
          <div className="text-[11px] font-semibold text-indigo-700 group-hover:underline mt-0.5">
            Housekeeping board →
          </div>
        </div>

        {/* 6. Advance Bookings */}
        <div
          onClick={() => navigate(AppEndPoints.RESERVATIONS)}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Advance</span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <MdCalendarMonth size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-purple-700 mt-1 font-mono">
            {reservations.filter((r) => r.status === "CONFIRMED").length}
          </div>
          <div className="text-[11px] font-semibold text-indigo-700 group-hover:underline mt-0.5">
            Tape chart calendar →
          </div>
        </div>
      </div>

      {/* Main Room Matrix Section: Double-Bezel Card Container */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        {/* Section Header & Segmented Status Filter Tabs */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Live Room Matrix & Inventory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant front-desk guest folio access, POS billing, and housekeeping turnover
            </p>
          </div>

          {/* Elegant Segmented Control */}
          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({rooms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("AVAILABLE")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filter === "AVAILABLE"
                  ? "bg-white text-emerald-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Available ({counts.AVAILABLE})
            </button>
            <button
              type="button"
              onClick={() => setFilter("OCCUPIED")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filter === "OCCUPIED"
                  ? "bg-white text-rose-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Occupied ({counts.OCCUPIED})
            </button>
            <button
              type="button"
              onClick={() => setFilter("CLEANING")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filter === "CLEANING"
                  ? "bg-white text-amber-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Cleaning ({counts.CLEANING})
            </button>
            <button
              type="button"
              onClick={() => setFilter("MAINTENANCE")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filter === "MAINTENANCE"
                  ? "bg-white text-slate-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Maintenance ({counts.MAINTENANCE})
            </button>
          </div>
        </div>

        {!isLoading && rooms.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <p className="font-semibold text-slate-700">No rooms configured yet</p>
            <p className="text-xs text-slate-500 mb-4 mt-1">
              Click below to load complete realistic hotel demo data (15 rooms, stays, orders, bookings) or configure rooms manually.
            </p>
            <div className="flex items-center justify-center gap-3">
              <UISubmitButton type="button" text="Load Demo Data" loading={loadingDemo} onClick={handleLoadDemo} />
              <UISubmitButton type="button" variant="outlined" text="Configure Rooms" onClick={() => navigate(AppEndPoints.ROOM_LIST)} />
            </div>
          </div>
        )}

        {floors.map(([floor, list]) => (
          <div key={floor} className="mb-6 last:mb-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {floor}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">({list.length} rooms)</span>
              <div className="h-px bg-slate-100 flex-1 ml-2" />
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {list.map((room) => {
                const stay = activeByRoom.get(room.id);
                return (
                  <RoomTile
                    key={room.id}
                    room={room}
                    roomTypeName={roomTypes.find((t) => t.id === room.roomTypeId)?.name ?? "Standard"}
                    stay={stay}
                    now={now}
                    onCheckIn={() => navigate(`${AppEndPoints.CHECK_IN}?room=${room.id}`)}
                    onOpenStay={() => stay && navigate(buildPath(AppEndPoints.STAY_DETAILS, stay.id))}
                    onCheckOut={() => stay && setCheckoutStay(stay)}
                    onOrderService={() => navigate(AppEndPoints.POS_SERVICES)}
                    onSetStatus={(s) => setStatus(room.id, s)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Performance Charts */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        {/* 7-Day Revenue Trend */}
        <SectionBox className="lg:col-span-2 bg-white shadow-2xs rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Typography variant="h6" fontWeight={800} className="text-slate-900 leading-tight">
                7-Day Revenue Trend
              </Typography>
              <Typography variant="caption" className="text-slate-500 font-medium">
                Daily settled checkout receipts & room earnings
              </Typography>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              Settled Folios
            </span>
          </div>

          <Box sx={{ height: 230 }} className="pt-2">
            <ResponsiveContainer>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} fontSize={12} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={55} stroke="#64748b" />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#0F172A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionBox>

        {/* Plan Distribution */}
        <SectionBox className="bg-white shadow-2xs rounded-2xl">
          <Typography variant="h6" fontWeight={800} className="text-slate-900 leading-tight">
            Tariff Popularity
          </Typography>
          <Typography variant="caption" className="text-slate-500 font-medium block mb-2">
            30-day guest stay plan distribution
          </Typography>

          {planData.length === 0 ? (
            <Typography variant="body2" className="py-10 text-center text-slate-400">
              No completed stays data yet
            </Typography>
          ) : (
            <Box sx={{ height: 210 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={planData}
                    dataKey="revenue"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {planData.map((_p, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), "Total"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}

          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs pt-1">
            {planData.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5 font-medium text-slate-700">
                <i
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {p.name}
              </span>
            ))}
          </div>
        </SectionBox>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog stay={checkoutStay} onClose={() => setCheckoutStay(null)} />
    </MainContainer>
  );
}
