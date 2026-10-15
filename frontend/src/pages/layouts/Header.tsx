import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Menu } from "lucide-react";
import { Button } from "../../components/ui/button";
import UpiQrModal from "../../components/ui/models/UpiQrModal";
import GlobalSearch from "./components/GlobalSearch";
import HeaderTools from "./components/HeaderTools";
import { useNow } from "../../hooks/useNow";
import { useGetGuestsQuery } from "../../store/services/guest/guestSlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetSettingsQuery, useLoadDemoDataMutation } from "../../store/services/settings/settingsSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { buildPath, getErrorMessage } from "../../utils/helper/helper";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { useThemeMode } from "../../utils/theme/themeContext";

interface HeaderProps { onMenuClick?: () => void; }
interface Notice { id: string; title: string; detail: string; href: string; }

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const now = useNow(15000);
  const { preference, setPreference } = useThemeMode();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: stays = [] } = useGetStaysQuery();
  const { data: reservations = [] } = useGetReservationsQuery();
  const { data: guests = [] } = useGetGuestsQuery();
  const { data: settings } = useGetSettingsQuery();
  const [loadDemo, { isLoading: loadingDemo }] = useLoadDemoDataMutation();
  const hotelName = settings?.hotelName || "Grand Horizon Hotel";

  const occupiedCount = rooms.filter((room) => room.status === "OCCUPIED").length;
  const occupancyRate = rooms.length ? Math.round((occupiedCount / rooms.length) * 100) : 0;
  const availableCount = rooms.filter((room) => room.status === "AVAILABLE").length;
  const cleaningCount = rooms.filter((room) => room.status === "CLEANING").length;

  const notices = useMemo<Notice[]>(() => {
    const arrivals = reservations.filter((booking) => booking.status === "CONFIRMED" && dayjs(booking.checkInDate).isSame(dayjs(), "day")).slice(0, 4).map((booking) => ({ id: `arr-${booking.id}`, title: `Arrival · ${booking.guestName}`, detail: booking.bookingNo, href: AppEndPoints.RESERVATIONS }));
    const balances = stays.filter((stay) => stay.status === "ACTIVE" && stay.dueAmount > 0).slice(0, 4).map((stay) => ({ id: `due-${stay.id}`, title: `Balance due · ${stay.guestName}`, detail: stay.stayNo, href: buildPath(AppEndPoints.STAY_DETAILS, stay.id) }));
    const cleaningNotice = cleaningCount ? [{ id: "cleaning", title: `${cleaningCount} room${cleaningCount === 1 ? "" : "s"} in cleaning`, detail: "Housekeeping board", href: AppEndPoints.HOUSEKEEPING }] : [];
    return [...arrivals, ...balances, ...cleaningNotice];
  }, [reservations, stays, cleaningCount]);

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
    <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)] px-3 sm:px-5">
      <div className="relative flex min-w-0 flex-1 items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={onMenuClick}><Menu aria-hidden="true" /></Button>
        <GlobalSearch query={query} setQuery={setQuery} focused={searchFocused} setFocused={setSearchFocused} rooms={rooms} guests={guests} reservations={reservations} stays={stays} onNavigate={go} />
      </div>
      <HeaderTools occupancy={occupancyRate} available={availableCount} roomsEmpty={rooms.length === 0} loadingDemo={loadingDemo} notices={notices} hotelName={hotelName} now={now} preference={preference} onPreferenceChange={setPreference} onNavigate={navigate} onOpenUpi={() => setShowUpiModal(true)} onLoadDemo={handleLoadDemo} />
    </header>
    <UpiQrModal open={showUpiModal} onClose={() => setShowUpiModal(false)} hotelName={hotelName} upiId={settings?.upiId || "grandhorizon@okaxis"} amount={1000} description="Hotel Counter Payment" />
  </>;
}
