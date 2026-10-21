import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Building2, Menu, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import UpiQrModal from "../../components/ui/models/UpiQrModal";
import { NewHotelModal } from "../chain-portfolio/components/NewHotelModal";
import GlobalSearch from "./components/GlobalSearch";
import HeaderTools from "./components/HeaderTools";
import { useNow } from "../../hooks/useNow";
import { useGetGuestsQuery } from "../../store/services/guest/guestSlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetSettingsQuery, useLoadDemoDataMutation } from "../../store/services/settings/settingsSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import {
  useCreatePropertyMutation,
  useGetPropertiesQuery,
  useSwitchActivePropertyMutation,
} from "../../store/services/property/propertySlice";
import { buildPath, getErrorMessage } from "../../utils/helper/helper";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { useDeskRole } from "../../utils/access/deskRole";
import { useThemeMode } from "../../utils/theme/themeContext";

interface HeaderProps { onMenuClick?: () => void; }
interface Notice { id: string; title: string; detail: string; href: string; }

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const now = useNow(15000);
  const { preference, setPreference } = useThemeMode();
  const { role } = useDeskRole();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: stays = [] } = useGetStaysQuery();
  const { data: reservations = [] } = useGetReservationsQuery();
  const { data: guests = [] } = useGetGuestsQuery();
  const { data: settings } = useGetSettingsQuery();
  const { data: properties = [] } = useGetPropertiesQuery();
  const [switchProperty] = useSwitchActivePropertyMutation();
  const [createProperty, { isLoading: isCreatingProperty }] = useCreatePropertyMutation();
  const [loadDemo, { isLoading: loadingDemo }] = useLoadDemoDataMutation();
  const hotelName = settings?.hotelName || "Grand Horizon Hotel";

  const occupiedCount = rooms.filter((room) => room.status === "OCCUPIED").length;
  const occupancyRate = rooms.length ? Math.round((occupiedCount / rooms.length) * 100) : 0;
  const availableCount = rooms.filter((room) => room.status === "AVAILABLE").length;
  const cleaningCount = rooms.filter((room) => room.status === "CLEANING").length;

  const notices = useMemo<Notice[]>(() => {
    const arrivals = reservations.filter((booking) => booking.status === "CONFIRMED" && dayjs(booking.checkInDate).isSame(dayjs(), "day")).slice(0, 4).map((booking) => ({ id: `arr-${booking.id}`, title: `Arrival · ${booking.guestName}`, detail: booking.bookingNo, href: AppEndPoints.RESERVATIONS }));
    const balances = stays.filter((stay) => stay.status === "ACTIVE" && stay.dueAmount > 0).slice(0, 4).map((stay) => ({ id: `due-${stay.id}`, title: `Balance due · ${stay.guestName}`, detail: stay.stayNo, href: buildPath(AppEndPoints.STAY_DETAILS, stay.id) }));
    const cleaningNotice = cleaningCount ? [{ id: "cleaning", title: `${cleaningCount} room${cleaningCount === 1 ? "" : "s"} in cleaning`, detail: role === "RECEPTION" ? "See the room board" : "Housekeeping board", href: role === "RECEPTION" ? AppEndPoints.DASHBOARD : AppEndPoints.HOUSEKEEPING }] : [];
    return [...arrivals, ...balances, ...cleaningNotice];
  }, [reservations, stays, cleaningCount, role]);

  const handleLoadDemo = async () => {
    try { await loadDemo().unwrap(); toast.success("Complete hotel management demo data loaded."); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  const go = (path: string) => {
    navigate(path);
    setQuery("");
    setSearchFocused(false);
  };

  return <>
    <header className="no-print sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)] px-3 sm:px-5 xl:px-7">
      <div className="relative flex min-w-0 flex-1 items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={onMenuClick}><Menu aria-hidden="true" /></Button>
        <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:flex">
          {role === "SUPER_ADMIN" ? "Chain Office" : role === "ADMIN" ? "Hotel Admin" : "Front Desk"}
        </div>
        {role === "SUPER_ADMIN" ? (
          <div className="hidden items-center gap-1.5 lg:flex">
            <label className="min-w-0">
              <span className="sr-only">Hotel Property</span>
              <select
                aria-label="Hotel Property"
                value={properties.find((p) => p.name === hotelName)?.id || properties.find((p) => p.active)?.id || ""}
                onChange={async (event) => {
                  const targetId = event.target.value;
                  if (!targetId) return;
                  try {
                    const target = await switchProperty(targetId).unwrap();
                    toast.success(`Switched active property to: ${target.name}`);
                  } catch (error) {
                    toast.error(getErrorMessage(error));
                  }
                }}
                className="h-11 max-w-[12rem] cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-brand-300"
              >
                {properties.length > 0 ? (
                  properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                ) : (
                  <option value="">{hotelName}</option>
                )}
              </select>
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddHotelModal(true)}
              title="Add New Hotel Property"
              className="h-11 gap-1 px-2.5 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span className="hidden xl:inline">Add Hotel</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(AppEndPoints.CHAIN_PORTFOLIO)}
              title="Super Admin Chain Portfolio View"
              className="h-11 w-11 p-0 text-slate-600 hover:text-brand-800 dark:text-slate-300"
            >
              <Building2 className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:flex">
            <Building2 className="size-3.5 text-brand-600 dark:text-brand-400" />
            <span className="max-w-[13rem] truncate">{hotelName}</span>
          </div>
        )}
        <GlobalSearch query={query} setQuery={setQuery} focused={searchFocused} setFocused={setSearchFocused} rooms={rooms} guests={guests} reservations={reservations} stays={stays} onNavigate={go} />
      </div>
      <HeaderTools occupancy={occupancyRate} available={availableCount} roomsEmpty={rooms.length === 0} loadingDemo={loadingDemo} notices={notices} hotelName={hotelName} now={now} preference={preference} onPreferenceChange={setPreference} onNavigate={navigate} onOpenUpi={() => setShowUpiModal(true)} onLoadDemo={handleLoadDemo} role={role} />
    </header>
    <UpiQrModal open={showUpiModal} onClose={() => setShowUpiModal(false)} hotelName={hotelName} upiId={settings?.upiId || "hotel@upi"} amount={1000} description="Hotel Counter Payment" />
    <NewHotelModal
      open={showAddHotelModal}
      onClose={() => setShowAddHotelModal(false)}
      onSubmit={async (data) => {
        try {
          const created = await createProperty(data).unwrap();
          toast.success(`Added ${created.name} to chain portfolio!`);
          setShowAddHotelModal(false);
        } catch {
          toast.error("Failed to add hotel");
        }
      }}
      isLoading={isCreatingProperty}
    />
  </>;
}
