import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Download, LogIn, Printer } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { Button } from "../../components/ui/button";
import { presetRange, type DateRangeValue } from "../../components/forms/dateRangePresets";
import { printDocument } from "../../components/print/printPdf/printDocumentUtils";
import { exportToExcel } from "../../components/print/printExcel/ExportToExcel";
import CheckoutDialog from "./components/CheckoutDialog";
import StayMetrics from "./components/StayMetrics";
import StayFilters from "./components/StayFilters";
import StayResults from "./components/StayResults";
import { useDeleteStayMutation, useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useLoadDemoDataMutation } from "../../store/services/settings/settingsSlice";
import { useNow } from "../../hooks/useNow";
import { useClientPagination } from "../../hooks/useClientPagination";
import { ShowConfirmModal } from "../../hooks/useShowConfirmModal";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { calculateBill } from "../../utils/helper/billing";
import { billForStayRooms, stayRoomCount } from "../../utils/helper/stayRooms";
import { buildPath, formatDuration, getErrorMessage } from "../../utils/helper/helper";
import { formatDateTime } from "../../utils/date/dateUtils";
import type { Stay } from "../../utils/interfaces/Interface";
import type { StayTabFilter, StayViewMode } from "./components/stayTypes";

const EXCEL_COLUMNS = ["Sr No", "Stay No", "Guest Name", "Phone", "Room", "Plan", "Check-In", "Check-Out", "Duration", "Folio Total", "Paid Advance", "Balance Due", "Status"].map((label) => ({ label }));

export default function Stays() {
  const navigate = useNavigate();
  const now = useNow(30000);
  const nowIso = new Date(now).toISOString();
  const { data: stays = [], isLoading } = useGetStaysQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const [deleteStay] = useDeleteStayMutation();
  const [loadDemo, { isLoading: loadingDemo }] = useLoadDemoDataMutation();
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<StayTabFilter>("ACTIVE");
  const [viewMode, setViewMode] = useState<StayViewMode>("GRID");
  const [range, setRange] = useState<DateRangeValue>(presetRange("all"));
  const [checkoutStay, setCheckoutStay] = useState<Stay | null>(null);

  const activeStays = useMemo(() => stays.filter((stay) => stay.status === "ACTIVE"), [stays]);
  const getStayBill = (stay: Stay) =>
    stay.status === "ACTIVE"
      ? billForStayRooms(
          calculateBill({ plan: stay.plan, checkInAt: stay.checkInAt, checkOutAt: nowIso, expectedCheckOutAt: stay.expectedCheckOutAt, extraCharges: stay.extraCharges, discount: stay.discount, taxPercent: stay.taxPercent }),
          stayRoomCount(stay),
        )
      : stay.bill;
  const totalInHouseHeadcount = activeStays.reduce((sum, stay) => sum + ((stay.guestCount ?? 0) > 0 ? (stay.guestCount ?? 1) : 1 + (stay.companions || []).filter((companion) => companion.name.trim()).length), 0);
  const totalLiveFolioSum = activeStays.reduce((sum, stay) => sum + (getStayBill(stay)?.total || 0), 0);
  const departingStays = useMemo(() => activeStays.filter((stay) => stay.expectedCheckOutAt && (dayjs(stay.expectedCheckOutAt).isSame(dayjs(now), "day") || dayjs(now).isAfter(dayjs(stay.expectedCheckOutAt)))), [activeStays, now]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stays.filter((stay) => {
      if (tabFilter === "ACTIVE" && stay.status !== "ACTIVE") return false;
      if (tabFilter === "COMPLETED" && stay.status !== "COMPLETED") return false;
      if (tabFilter === "DEPARTING_TODAY" && (!stay.expectedCheckOutAt || stay.status !== "ACTIVE" || (!dayjs(stay.expectedCheckOutAt).isSame(dayjs(now), "day") && !dayjs(now).isAfter(dayjs(stay.expectedCheckOutAt))))) return false;
      if (range.from && dayjs(stay.checkInAt).isBefore(dayjs(range.from).startOf("day"))) return false;
      if (range.to && dayjs(stay.checkInAt).isAfter(dayjs(range.to).endOf("day"))) return false;
      return !query || [stay.guestName, stay.guestPhone, stay.roomNumber, stay.stayNo].some((value) => value.toLowerCase().includes(query));
    });
  }, [stays, tabFilter, search, range, now]);

  const pg = useClientPagination(filtered, 12);
  const exportRows = filtered.map((stay, index) => {
    const bill = getStayBill(stay);
    return { srNo: index + 1, stayNo: stay.stayNo, guestName: stay.guestName, phone: stay.guestPhone, room: stay.roomNumber, plan: stay.plan.name, checkIn: formatDateTime(stay.checkInAt), checkOut: stay.checkOutAt ? formatDateTime(stay.checkOutAt) : `Expected: ${formatDateTime(stay.expectedCheckOutAt)}`, duration: bill ? formatDuration(bill.elapsedMinutes) : "-", amount: bill ? bill.total : stay.totalAmount, paid: stay.paidAmount || stay.advanceAmount, due: stay.dueAmount, status: stay.status };
  });

  const handleDelete = async (stay: Stay) => {
    const confirmed = await ShowConfirmModal({ title: "Delete Stay Record?", text: stay.status === "ACTIVE" ? `Guest ${stay.guestName} is currently in Room ${stay.roomNumber}. Deleting will release the room immediately.` : `Permanently delete record for ${stay.stayNo}?`, confirmButtonText: "Delete Record" });
    if (!confirmed) return;
    try { await deleteStay(stay.id).unwrap(); toast.success("Stay record removed"); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleLoadDemo = async () => {
    try { await loadDemo().unwrap(); toast.success("Complete hotel management demo data loaded!"); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  return <MainContainer>
    <PageTitle title="In-house stays" subtitle="Current guests, running folios, and departures that need attention." actions={<>
      <Button variant="outline" size="sm" onClick={() => printDocument(exportRows, EXCEL_COLUMNS, "In-House Stays")}><Printer size={16} aria-hidden="true" /> Print PDF</Button>
      <Button variant="outline" size="sm" onClick={() => exportToExcel(exportRows, EXCEL_COLUMNS, "InHouse_Stays.xlsx")}><Download size={16} aria-hidden="true" /> Export Excel</Button>
      <Button variant="primary" size="sm" onClick={() => navigate(AppEndPoints.CHECK_IN)}><LogIn size={16} aria-hidden="true" /> New check-in</Button>
    </>} />
    <StayMetrics activeRooms={activeStays.length} guestCount={totalInHouseHeadcount} liveFolioTotal={totalLiveFolioSum} departures={departingStays.length} onShowDepartures={() => setTabFilter("DEPARTING_TODAY")} />
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-panel sm:p-6">
      <StayFilters tab={tabFilter} setTab={setTabFilter} view={viewMode} setView={setViewMode} search={search} setSearch={setSearch} range={range} setRange={setRange} activeCount={activeStays.length} departingCount={departingStays.length} completedCount={stays.filter((stay) => stay.status === "COMPLETED").length} allCount={stays.length} resetPage={pg.reset} />
      <StayResults loading={isLoading} demoLoading={loadingDemo} view={viewMode} tab={tabFilter} filtered={filtered} pageItems={pg.pageItems} rooms={rooms} now={now} offset={pg.offset} pageNumber={pg.pageNumber} pageSize={pg.pageSize} totalPages={pg.totalPages} totalCount={pg.totalCount} getBill={getStayBill} onLoadDemo={handleLoadDemo} onNewCheckIn={() => navigate(AppEndPoints.CHECK_IN)} onView={(stay) => navigate(buildPath(AppEndPoints.STAY_DETAILS, stay.id))} onRoomService={() => navigate(AppEndPoints.POS_SERVICES)} onCheckout={setCheckoutStay} onDelete={handleDelete} onPageChange={pg.setPageNumber} onPageSizeChange={pg.setPageSize} />
    </div>
    <CheckoutDialog stay={checkoutStay} onClose={() => setCheckoutStay(null)} />
  </MainContainer>;
}
