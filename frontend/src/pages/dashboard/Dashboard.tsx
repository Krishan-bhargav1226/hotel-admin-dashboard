import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { CalendarDays, ConciergeBell, LogIn, Crown, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import CheckoutDialog from "../stays/components/CheckoutDialog";
import DashboardMetrics from "./components/DashboardMetrics";
import DashboardAlerts from "./components/DashboardAlerts";
import RoomStatusBoard, { type RoomBoardFilter } from "./components/RoomStatusBoard";
import DashboardAnalytics from "./components/DashboardAnalytics";
import SuperAdminDashboard from "./super-admin/SuperAdminDashboard";
import { useGetRoomsQuery, useUpdateRoomStatusMutation } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { useGetServiceOrdersQuery } from "../../store/services/pos/posSlice";
import { useGetMaintenanceTicketsQuery } from "../../store/services/housekeeping/housekeepingSlice";
import { useGetSettingsQuery, useLoadDemoDataMutation } from "../../store/services/settings/settingsSlice";
import { useNow } from "../../hooks/useNow";
import { useDeskRole } from "../../utils/access/deskRole";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { buildPath, getErrorMessage } from "../../utils/helper/helper";
import { calculateBill } from "../../utils/helper/billing";
import { billForStayRooms, stayRoomCount } from "../../utils/helper/stayRooms";
import type { RoomStatus, Stay } from "../../utils/interfaces/Interface";

export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = useDeskRole();
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
  const [filter, setFilter] = useState<RoomBoardFilter>("ALL");
  const [checkoutStay, setCheckoutStay] = useState<Stay | null>(null);
  const [superAdminView, setSuperAdminView] = useState<"CHAIN_HQ" | "HOTEL_DESK">("CHAIN_HQ");

  const activeByRoom = useMemo(() => {
    const byRoom = new Map<string, Stay>();
    stays.filter((stay) => stay.status === "ACTIVE").forEach((stay) => {
      const ids = stay.roomIds?.length ? stay.roomIds : [stay.roomId];
      ids.forEach((id) => byRoom.set(id, stay));
    });
    return byRoom;
  }, [stays]);
  const counts = useMemo(() => {
    const result: Record<RoomStatus, number> = { AVAILABLE: 0, OCCUPIED: 0, CLEANING: 0, MAINTENANCE: 0 };
    rooms.forEach((room) => { result[room.status] += 1; });
    return result;
  }, [rooms]);
  const todayDone = stays.filter((stay) => stay.status === "COMPLETED" && stay.checkOutAt && dayjs(stay.checkOutAt).isSame(dayjs(), "day"));
  const todayRevenue = todayDone.reduce((sum, stay) => sum + stay.totalAmount, 0);
  const checkInsToday = stays.filter((stay) => dayjs(stay.checkInAt).isSame(dayjs(), "day")).length;
  const activeStays = stays.filter((stay) => stay.status === "ACTIVE");
  const runningTotal = activeStays.reduce((sum, stay) => sum + billForStayRooms(calculateBill({ plan: stay.plan, checkInAt: stay.checkInAt, checkOutAt: new Date(now).toISOString(), expectedCheckOutAt: stay.expectedCheckOutAt, extraCharges: stay.extraCharges, discount: stay.discount, taxPercent: stay.taxPercent }), stayRoomCount(stay)).total, 0);
  const pendingDue = stays.reduce((sum, stay) => sum + stay.dueAmount, 0);
  const occupancy = rooms.length ? Math.round((counts.OCCUPIED / rooms.length) * 100) : 0;
  const upcomingToday = reservations.filter((reservation) => reservation.status === "CONFIRMED" && dayjs(reservation.checkInDate).isSame(dayjs(), "day"));
  const reservedByRoom = useMemo(() => {
    const holds = new Map<string, { guestName: string; guestPhone: string }>();
    reservations.forEach((reservation) => {
      if (reservation.status === "CONFIRMED" && reservation.roomId && dayjs(reservation.checkInDate).isSame(dayjs(), "day")) {
        holds.set(reservation.roomId, { guestName: reservation.guestName, guestPhone: reservation.guestPhone });
      }
    });
    return holds;
  }, [reservations]);
  const overdueCount = activeStays.filter((stay) => stay.expectedCheckOutAt && dayjs(now).diff(dayjs(stay.expectedCheckOutAt), "minute") > (stay.plan.graceMinutes ?? 0)).length;
  const departingCount = activeStays.filter((stay) => stay.expectedCheckOutAt && (dayjs(stay.expectedCheckOutAt).isSame(dayjs(now), "day") || dayjs(now).isAfter(dayjs(stay.expectedCheckOutAt)))).length;
  const pendingOrders = serviceOrders.filter((order) => order.status === "PREPARING" || order.status === "PENDING");
  const urgentRepairs = maintenanceTickets.filter((ticket) => ticket.status !== "RESOLVED" && (ticket.priority === "HIGH" || ticket.priority === "EMERGENCY"));

  const floors = useMemo(() => {
    const visible = rooms.filter((room) => {
      if (filter === "ALL") return true;
      if (filter === "DEPARTING") {
        const stay = activeByRoom.get(room.id);
        return Boolean(stay && stay.expectedCheckOutAt && (dayjs(stay.expectedCheckOutAt).isSame(dayjs(now), "day") || dayjs(now).isAfter(dayjs(stay.expectedCheckOutAt))));
      }
      return room.status === filter;
    });
    const byFloor = new Map<string, typeof rooms>();
    visible.forEach((room) => {
      const floor = room.floor || "General Rooms";
      byFloor.set(floor, [...(byFloor.get(floor) ?? []), room]);
    });
    return [...byFloor.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
  }, [rooms, filter, activeByRoom, now]);

  const handleLoadDemo = async () => {
    try { await loadDemo().unwrap(); toast.success("Complete hotel management demo data loaded!"); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleSetStatus = async (id: string, status: RoomStatus) => {
    try { await updateStatus({ id, status }).unwrap(); toast.success("Room status updated"); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  if (role === "SUPER_ADMIN" && superAdminView === "CHAIN_HQ") {
    return (
      <MainContainer>
        <SuperAdminDashboard onSwitchToFrontDesk={() => setSuperAdminView("HOTEL_DESK")} />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      {role === "SUPER_ADMIN" && (
        <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/80 p-2.5 px-3.5 text-xs text-brand-900 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
          <div className="flex items-center gap-2">
            <Crown className="size-4 text-brand-600 dark:text-brand-400" />
            <span>
              Inspecting individual operational front desk for <strong>{settings?.hotelName}</strong>.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={ArrowLeft}
            className="h-7 text-xs font-semibold"
            onClick={() => setSuperAdminView("CHAIN_HQ")}
          >
            Return to Chain HQ
          </Button>
        </div>
      )}

      <PageTitle title={settings?.hotelName || "Grand Horizon Hotel"} subtitle={<span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="inline-flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />Front desk is live</span><span aria-hidden="true">·</span><span>{dayjs(now).format("dddd, DD/MM/YYYY")}</span></span>} actions={
        <>
          <Button variant="outline" size="sm" icon={CalendarDays} onClick={() => navigate(AppEndPoints.RESERVATIONS)}>Reservations</Button>
          <Button variant="outline" size="sm" icon={ConciergeBell} onClick={() => navigate(AppEndPoints.POS_SERVICES)}>Room service</Button>
          <Button variant="primary" size="sm" icon={LogIn} onClick={() => navigate(AppEndPoints.CHECK_IN)}>New check-in</Button>
        </>
      } />

      <DashboardAlerts arrivals={upcomingToday.length} pendingOrders={pendingOrders.length} urgentRepairs={urgentRepairs.length} overdue={overdueCount} onReservations={() => navigate(AppEndPoints.RESERVATIONS)} onRoomService={() => navigate(AppEndPoints.POS_SERVICES)} onHousekeeping={() => (role === "RECEPTION" ? setFilter("MAINTENANCE") : navigate(AppEndPoints.HOUSEKEEPING))} onStays={() => navigate(AppEndPoints.STAY_LIST)} />
      <DashboardMetrics occupancy={occupancy} occupied={counts.OCCUPIED} roomCount={rooms.length} available={counts.AVAILABLE} todayRevenue={todayRevenue} checkInsToday={checkInsToday} departuresToday={todayDone.length} runningTotal={runningTotal} activeStays={activeStays.length} pendingDue={pendingDue} cleaning={counts.CLEANING} confirmedBookings={reservations.filter((reservation) => reservation.status === "CONFIRMED").length} onCleaning={role === "RECEPTION" ? () => setFilter("CLEANING") : undefined} />
      <RoomStatusBoard rooms={rooms} roomTypes={roomTypes} floors={floors} activeByRoom={activeByRoom} reservedByRoom={reservedByRoom} counts={counts} departingCount={departingCount} filter={filter} onFilter={setFilter} isLoading={isLoading} canManageProperty={role !== "RECEPTION"} onLoadDemo={handleLoadDemo} loadingDemo={loadingDemo} onAddRooms={() => navigate(AppEndPoints.ROOM_LIST)} now={now} onCheckIn={(room) => navigate(`${AppEndPoints.CHECK_IN}?room=${room.id}`)} onOpenStay={(stay) => navigate(buildPath(AppEndPoints.STAY_DETAILS, stay.id))} onCheckOut={setCheckoutStay} onOrderService={() => navigate(AppEndPoints.POS_SERVICES)} onSetStatus={handleSetStatus} />
      <DashboardAnalytics stays={stays} />
      <CheckoutDialog stay={checkoutStay} onClose={() => setCheckoutStay(null)} />
    </MainContainer>
  );
}
