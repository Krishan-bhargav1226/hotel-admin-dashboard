import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  MdKey,
  MdPeople,
  MdAttachMoney,
  MdWarning,
  MdLogin,
  MdLogout,
  MdRoomService,
  MdReceiptLong,
  MdGridView,
  MdViewList,
  MdDeleteOutline,
  MdSearch,
  MdFileDownload,
  MdPrint,
  MdAccessTime,
  MdCheckCircle,
  MdRefresh,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import RenderTable from "../../components/tables/RenderTable";
import { TableRow } from "../../components/tables/TableRow";
import TablePaginationControls from "../../components/tables/TablePaginationControls";
import LoadingTable from "../../components/constants/LoadingTable";
import InBetweenDateSearch, { presetRange, type DateRangeValue } from "../../components/forms/InBetweenDateSearch";
import { printDocument } from "../../components/print/printPdf/PrintDocument";
import { exportToExcel } from "../../components/print/printExcel/ExportToExcel";
import CheckoutDialog from "./components/CheckoutDialog";
import { useDeleteStayMutation, useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useLoadDemoDataMutation } from "../../store/services/settings/settingsSlice";
import { useNow } from "../../hooks/useNow";
import { useClientPagination } from "../../hooks/useClientPagination";
import { ShowConfirmModal } from "../../hooks/useShowConfirmModal";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { calculateBill } from "../../utils/helper/billing";
import { buildPath, formatCurrency, formatDuration, getErrorMessage } from "../../utils/helper/helper";
import { formatDateTime } from "../../utils/date/dateUtils";
import type { Stay } from "../../utils/interfaces/Interface";

type TabFilter = "ACTIVE" | "DEPARTING_TODAY" | "COMPLETED" | "ALL";
type ViewMode = "GRID" | "TABLE";

const tableColumns = [
  { label: "Sr" },
  { label: "Stay ID" },
  { label: "Guest Profile" },
  { label: "Room / Cat" },
  { label: "Tariff Plan" },
  { label: "Check-In" },
  { label: "Check-Out / Expected" },
  { label: "Folio Balance" },
  { label: "Status" },
  { label: "Actions" },
];

const excelColumns = [
  { label: "Sr No" },
  { label: "Stay No" },
  { label: "Guest Name" },
  { label: "Phone" },
  { label: "Room" },
  { label: "Plan" },
  { label: "Check-In" },
  { label: "Check-Out" },
  { label: "Duration" },
  { label: "Folio Total" },
  { label: "Paid Advance" },
  { label: "Balance Due" },
  { label: "Status" },
];

export default function Stays() {
  const navigate = useNavigate();
  const now = useNow(30000);
  const nowIso = new Date(now).toISOString();

  const { data: stays = [], isLoading } = useGetStaysQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const [deleteStay] = useDeleteStayMutation();
  const [loadDemo, { isLoading: loadingDemo }] = useLoadDemoDataMutation();

  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<TabFilter>("ACTIVE");
  const [viewMode, setViewMode] = useState<ViewMode>("GRID");
  const [range, setRange] = useState<DateRangeValue>(presetRange("all"));
  const [checkoutStay, setCheckoutStay] = useState<Stay | null>(null);

  // Active in-house stays
  const activeStays = useMemo(() => stays.filter((s) => s.status === "ACTIVE"), [stays]);

  // Live bill computation for active stays
  const getStayBill = (s: Stay) => {
    if (s.status === "ACTIVE") {
      return calculateBill({
        plan: s.plan,
        checkInAt: s.checkInAt,
        checkOutAt: nowIso,
        expectedCheckOutAt: s.expectedCheckOutAt,
        extraCharges: s.extraCharges,
        discount: s.discount,
        taxPercent: s.taxPercent,
      });
    }
    return s.bill;
  };

  // Metrics
  const totalActiveRooms = activeStays.length;
  const totalInHouseHeadcount = activeStays.reduce(
    (sum, s) => sum + 1 + s.companions.filter((c) => c.name.trim()).length,
    0
  );
  const totalLiveFolioSum = activeStays.reduce(
    (sum, s) => sum + (getStayBill(s)?.total || 0),
    0
  );

  const departingOrOverdueStays = useMemo(() => {
    return activeStays.filter((s) => {
      if (!s.expectedCheckOutAt) return false;
      const exp = dayjs(s.expectedCheckOutAt);
      const isToday = exp.isSame(dayjs(now), "day");
      const isPast = dayjs(now).isAfter(exp);
      return isToday || isPast;
    });
  }, [activeStays, now]);

  // Filtered List
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stays.filter((s) => {
      // Tab filter
      if (tabFilter === "ACTIVE" && s.status !== "ACTIVE") return false;
      if (tabFilter === "COMPLETED" && s.status !== "COMPLETED") return false;
      if (tabFilter === "DEPARTING_TODAY") {
        if (s.status !== "ACTIVE") return false;
        if (!s.expectedCheckOutAt) return false;
        const exp = dayjs(s.expectedCheckOutAt);
        const isToday = exp.isSame(dayjs(now), "day");
        const isPast = dayjs(now).isAfter(exp);
        if (!isToday && !isPast) return false;
      }

      // Date Range Filter
      if (range.from && dayjs(s.checkInAt).isBefore(dayjs(range.from).startOf("day"))) return false;
      if (range.to && dayjs(s.checkInAt).isAfter(dayjs(range.to).endOf("day"))) return false;

      // Text Search
      if (!q) return true;
      return [s.guestName, s.guestPhone, s.roomNumber, s.stayNo].some((x) =>
        x.toLowerCase().includes(q)
      );
    });
  }, [stays, tabFilter, search, range, now]);

  const pg = useClientPagination(filtered, 12);

  const exportRows = filtered.map((s, i) => {
    const b = getStayBill(s);
    return {
      srNo: i + 1,
      stayNo: s.stayNo,
      guestName: s.guestName,
      phone: s.guestPhone,
      room: s.roomNumber,
      plan: s.plan.name,
      checkIn: formatDateTime(s.checkInAt),
      checkOut: s.checkOutAt ? formatDateTime(s.checkOutAt) : `Expected: ${formatDateTime(s.expectedCheckOutAt)}`,
      duration: b ? formatDuration(b.elapsedMinutes) : "-",
      amount: b ? b.total : s.totalAmount,
      paid: s.paidAmount || s.advanceAmount,
      due: s.dueAmount,
      status: s.status,
    };
  });

  const handleDelete = async (s: Stay) => {
    const ok = await ShowConfirmModal({
      title: "Delete Stay Record?",
      text:
        s.status === "ACTIVE"
          ? `Guest ${s.guestName} is currently in Room ${s.roomNumber}. Deleting will release the room immediately.`
          : `Permanently delete record for ${s.stayNo}?`,
      confirmButtonText: "Delete Record",
    });
    if (!ok) return;
    try {
      await deleteStay(s.id).unwrap();
      toast.success("Stay record removed");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleLoadDemo = async () => {
    try {
      await loadDemo().unwrap();
      toast.success("Complete hotel management demo data loaded!");
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
              Front Desk Concierge · In-House Occupancy
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            In-House Stays & Guest Folios
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live resident guest tracking, automated running bill accumulation, and quick checkout settlement
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => printDocument(exportRows, excelColumns, "In-House Stays")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MdPrint size={15} className="text-slate-500" />
            <span>Print PDF</span>
          </button>

          <button
            type="button"
            onClick={() => exportToExcel(exportRows, excelColumns, "InHouse_Stays.xlsx")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MdFileDownload size={15} className="text-slate-500" />
            <span>Export Excel</span>
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

      {/* KPI Stat Ribbon (Taste-Skill Double-Bezel Bento Cards) */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* 1. In-House Rooms */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
              In-House Rooms
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MdKey size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-mono">
            {totalActiveRooms}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Active rooms occupied
          </div>
        </div>

        {/* 2. Total In-House Headcount */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
              Guest Headcount
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MdPeople size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 mt-1 font-mono">
            {totalInHouseHeadcount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Residents in hotel
          </div>
        </div>

        {/* 3. Live Running Folios */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
              Live Folios Total
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <MdAttachMoney size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-mono">
            {formatCurrency(totalLiveFolioSum)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Accumulating live revenue
          </div>
        </div>

        {/* 4. Due Checkout Today / Overdue */}
        <div
          onClick={() => setTabFilter("DEPARTING_TODAY")}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
              Departures Today
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <MdWarning size={14} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 mt-1 font-mono">
            {departingOrOverdueStays.length}
          </div>
          <div className="text-[11px] font-semibold text-rose-700 group-hover:underline mt-0.5">
            {departingOrOverdueStays.length === 0 ? "No overdue departures" : "Review checkouts →"}
          </div>
        </div>
      </div>

      {/* Main Content Area: Double-Bezel Card Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        {/* Filter Navigation Bar: Segmented Tab Switcher + View Mode */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
          {/* Segmented Filter Pills */}
          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => {
                setTabFilter("ACTIVE");
                pg.reset();
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "ACTIVE"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active In-House ({activeStays.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setTabFilter("DEPARTING_TODAY");
                pg.reset();
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "DEPARTING_TODAY"
                  ? "bg-white text-rose-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Departing Today ({departingOrOverdueStays.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setTabFilter("COMPLETED");
                pg.reset();
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "COMPLETED"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Past Checkouts Archive ({stays.filter((s) => s.status === "COMPLETED").length})
            </button>

            <button
              type="button"
              onClick={() => {
                setTabFilter("ALL");
                pg.reset();
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                tabFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Records ({stays.length})
            </button>
          </div>

          {/* Right Controls: View Switcher (Grid vs Table) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                id="view-mode-grid"
                type="button"
                onClick={() => setViewMode("GRID")}
                title="Grid Card View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "GRID" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MdGridView size={16} />
              </button>
              <button
                id="view-mode-table"
                type="button"
                onClick={() => setViewMode("TABLE")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "TABLE" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MdViewList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Date Controls Bar */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 w-full sm:w-80">
            <MdSearch size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search guest, mobile, room, stay ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                pg.reset();
              }}
              className="ml-2 text-xs bg-transparent focus:outline-none flex-1 text-slate-900"
            />
          </div>

          <InBetweenDateSearch
            value={range}
            defaultPreset="all"
            onChange={(r) => {
              setRange(r);
              pg.reset();
            }}
          />
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="py-16 text-center text-slate-400">
            <LoadingTable />
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <MdKey size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {tabFilter === "ACTIVE"
                ? "No active in-house guests currently"
                : "No matching stay records found"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {tabFilter === "ACTIVE"
                ? "All rooms are currently vacant or turnover cleaning. Click below to check in a guest or load demo data."
                : "Try clearing search filters or selecting another date range."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={handleLoadDemo}
                disabled={loadingDemo}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                <MdRefresh size={15} className={loadingDemo ? "animate-spin" : ""} />
                <span>{loadingDemo ? "Loading Demo..." : "Load Sample Demo Data"}</span>
              </button>

              {tabFilter === "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => navigate(AppEndPoints.CHECK_IN)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <MdLogin size={15} />
                  <span>New Guest Check-In</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 1: BENTO KEY CARDS GRID (DEFAULT FOR IN-HOUSE) */}
        {!isLoading && viewMode === "GRID" && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pg.pageItems.map((s) => {
              const isActive = s.status === "ACTIVE";
              const bill = getStayBill(s);
              const room = rooms.find((r) => r.id === s.roomId);

              const overdueMin =
                isActive && s.expectedCheckOutAt
                  ? dayjs(now).diff(dayjs(s.expectedCheckOutAt), "minute")
                  : 0;
              const isOverdue = isActive && !!s.expectedCheckOutAt && overdueMin > (s.plan.graceMinutes ?? 0);

              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200"
                >
                  <div>
                    {/* Top Header: Room Number, Floor & Status Pill */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xl font-bold tracking-tight text-slate-900">
                          Room {s.roomNumber}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {room?.floor || "Floor 1"}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          In-House
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <MdCheckCircle size={12} className="text-slate-500" />
                          Checked Out
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {s.roomTypeName}
                    </div>

                    {/* Guest Info */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {s.guestName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {s.stayNo}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {s.guestPhone}
                        {s.companions.length > 0 && (
                          <span className="ml-1 text-[11px] text-indigo-700 font-medium">
                            · +{s.companions.length} co-guest
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tariff & Duration */}
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <MdAccessTime size={13} className="text-slate-400 shrink-0" />
                      <span>{s.plan.name}</span>
                      <span className="text-slate-300">·</span>
                      <span>In since {dayjs(s.checkInAt).format("DD MMM, hh:mm A")}</span>
                    </div>

                    {/* Tabular Running Folio Box */}
                    <div className="mt-3 rounded-xl bg-slate-50/80 border border-slate-100/90 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">
                          {isActive ? "Elapsed Time" : "Stay Duration"}
                        </span>
                        <span className="font-mono font-semibold text-slate-700">
                          {bill ? formatDuration(bill.elapsedMinutes) : "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">
                          Advance Paid
                        </span>
                        <span className="font-mono font-medium text-emerald-700">
                          {formatCurrency(s.advanceAmount || s.paidAmount || 0)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-600 text-[10px] uppercase font-bold">
                          {isActive ? "Current Folio Bill" : "Settled Total"}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {bill ? formatCurrency(bill.total) : formatCurrency(s.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Departure Warning or Timestamp */}
                    {isOverdue ? (
                      <div className="mt-2 inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/60">
                        <MdWarning size={13} />
                        <span>Checkout Overdue by {formatDuration(overdueMin)}</span>
                      </div>
                    ) : s.expectedCheckOutAt && isActive ? (
                      <div className="mt-2 text-[11px] text-slate-400">
                        Scheduled departure:{" "}
                        <strong className="text-slate-700 font-semibold">
                          {dayjs(s.expectedCheckOutAt).format("hh:mm A, DD MMM")}
                        </strong>
                      </div>
                    ) : s.checkOutAt ? (
                      <div className="mt-2 text-[11px] text-slate-400">
                        Departed: {formatDateTime(s.checkOutAt)}
                      </div>
                    ) : null}
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigate(buildPath(AppEndPoints.STAY_DETAILS, s.id))}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <MdReceiptLong size={14} className="text-slate-500" />
                      <span>Folio</span>
                    </button>

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => navigate(AppEndPoints.POS_SERVICES)}
                        title="Order Room Service"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <MdRoomService size={15} />
                      </button>
                    )}

                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => setCheckoutStay(s)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <MdLogout size={13} />
                        <span>Check Out</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        title="Delete record"
                      >
                        <MdDeleteOutline size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: HIGH-DENSITY TABLE VIEW */}
        {!isLoading && viewMode === "TABLE" && filtered.length > 0 && (
          <RenderTable columns={tableColumns}>
            {pg.pageItems.map((s, index) => {
              const isActive = s.status === "ACTIVE";
              const bill = getStayBill(s);
              return (
                <TableRow key={s.id} itemIndex={index}>
                  <td className="p-3 font-mono text-xs text-slate-400">
                    {pg.offset + index + 1}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {s.stayNo}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-xs text-slate-900">{s.guestName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {s.guestPhone}
                      {s.companions.length > 0 && ` · +${s.companions.length}`}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-xs text-slate-900">
                      Room {s.roomNumber}
                    </div>
                    <div className="text-[11px] text-slate-500">{s.roomTypeName}</div>
                  </td>
                  <td className="p-3 text-xs text-slate-700">
                    {s.plan.name}
                  </td>
                  <td className="p-3 text-xs text-slate-600 whitespace-nowrap">
                    {formatDateTime(s.checkInAt)}
                  </td>
                  <td className="p-3 text-xs whitespace-nowrap">
                    {s.checkOutAt ? (
                      <span className="text-slate-600">{formatDateTime(s.checkOutAt)}</span>
                    ) : s.expectedCheckOutAt ? (
                      <span className="text-indigo-900 font-medium">
                        Exp: {dayjs(s.expectedCheckOutAt).format("DD MMM, hh:mm A")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-xs text-slate-900">
                      {bill ? formatCurrency(bill.total) : formatCurrency(s.totalAmount)}
                    </div>
                    {isActive ? (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Adv: {formatCurrency(s.advanceAmount)}
                      </div>
                    ) : s.dueAmount > 0 ? (
                      <div className="text-[10px] font-bold text-rose-600">
                        Due: {formatCurrency(s.dueAmount)}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In-House
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(buildPath(AppEndPoints.STAY_DETAILS, s.id))}
                        className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        Folio
                      </button>
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => setCheckoutStay(s)}
                          className="px-2 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Check Out
                        </button>
                      )}
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </TableRow>
              );
            })}
          </RenderTable>
        )}

        {/* PAGINATION CONTROLS */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <TablePaginationControls
            pageNumber={pg.pageNumber}
            pageSize={pg.pageSize}
            totalPages={pg.totalPages}
            totalCount={pg.totalCount}
            onPageChange={(p) => pg.setPageNumber(p)}
            onRowsPerPageChange={(e) => pg.setPageSize(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Instant Checkout Settlement Dialog */}
      <CheckoutDialog stay={checkoutStay} onClose={() => setCheckoutStay(null)} />
    </MainContainer>
  );
}
