import { useState, useMemo, useEffect } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  MdLogin,
  MdCalendarMonth,
  MdRoomService,
  MdAccountBalanceWallet,
  MdAdd,
  MdQrCodeScanner,
  MdBed,
  MdPerson,
  MdRefresh,
} from "react-icons/md";
import toast from "react-hot-toast";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { useNow } from "../../hooks/useNow";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { useGetGuestsQuery } from "../../store/services/guest/guestSlice";
import { useGetSettingsQuery, useLoadDemoDataMutation } from "../../store/services/settings/settingsSlice";
import { getErrorMessage } from "../../utils/helper/helper";
import UpiQrModal from "../../components/ui/models/UpiQrModal";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuIcon?: boolean;
}

export default function Header({ onMenuClick, showMenuIcon = false }: HeaderProps) {
  const navigate = useNavigate();
  const now = useNow(15000);
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [actionAnchor, setActionAnchor] = useState<null | HTMLElement>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: stays = [] } = useGetStaysQuery();
  const { data: reservations = [] } = useGetReservationsQuery();
  const { data: guests = [] } = useGetGuestsQuery();
  const { data: settings } = useGetSettingsQuery();
  const [loadDemo, { isLoading: loadingDemo }] = useLoadDemoDataMutation();

  const handleLoadDemo = async () => {
    try {
      await loadDemo().unwrap();
      toast.success("Complete hotel management demo data loaded!");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const occupiedCount = rooms.filter((r) => r.status === "OCCUPIED").length;
  const occupancyRate = rooms.length ? Math.round((occupiedCount / rooms.length) * 100) : 0;
  const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;

  // Global search matching
  const searchResults = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term || term.length < 2) return null;

    const matchedRooms = rooms
      .filter((r) => r.number.toLowerCase().includes(term))
      .slice(0, 3);
    const matchedGuests = guests
      .filter((g) => g.name.toLowerCase().includes(term) || g.phone.includes(term))
      .slice(0, 4);
    const matchedBookings = reservations
      .filter(
        (b) =>
          b.bookingNo.toLowerCase().includes(term) ||
          b.guestName.toLowerCase().includes(term)
      )
      .slice(0, 3);
    const matchedStays = stays
      .filter(
        (s) =>
          s.stayNo.toLowerCase().includes(term) ||
          s.guestName.toLowerCase().includes(term)
      )
      .slice(0, 3);

    return {
      rooms: matchedRooms,
      guests: matchedGuests,
      bookings: matchedBookings,
      stays: matchedStays,
      hasResults:
        matchedRooms.length > 0 ||
        matchedGuests.length > 0 ||
        matchedBookings.length > 0 ||
        matchedStays.length > 0,
    };
  }, [q, rooms, guests, reservations]);

  // Keyboard shortcut Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Toolbar
        className="border-b border-gray-200 bg-white text-gray-900 sticky top-0 z-20 shadow-xs"
        sx={{
          height: 64,
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Left: Mobile Toggle & Universal Search */}
        <Box className="flex items-center gap-3 relative">
          {showMenuIcon && (
            <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}

          <div
            className={`flex items-center rounded-xl border transition-all ${
              searchFocused
                ? "border-slate-900 bg-white shadow-xs ring-1 ring-slate-900/10"
                : "border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-slate-300"
            } px-3 py-1.5`}
            style={{ width: undefined }}
          >
            <SearchIcon fontSize="small" className="text-slate-400 shrink-0" />
            <InputBase
              id="global-search-input"
              placeholder="Search room, guest, booking..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
              sx={{ ml: 1, fontSize: 13, flex: 1, width: { xs: 160, sm: 220, md: 280 } }}
              inputProps={{ "aria-label": "global search" }}
            />
            <kbd className="hidden md:inline-block text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono shadow-2xs">
              Ctrl+K
            </kbd>
          </div>

          {/* Search Dropdown Results */}
          {searchFocused && searchResults && (
            <Box className="absolute top-12 left-0 w-full sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
              {!searchResults.hasResults ? (
                <div className="p-4 text-xs text-slate-500 text-center font-medium">
                  No matching rooms, guests, or bookings found
                </div>
              ) : (
                <>
                  {searchResults.rooms.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1">
                        Rooms
                      </div>
                      {searchResults.rooms.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                          onClick={() => {
                            navigate(AppEndPoints.ROOM_LIST);
                            setQ("");
                          }}
                        >
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <MdBed className="text-slate-600" size={16} />
                            Room {r.number}
                          </div>
                          <Chip
                            size="small"
                            label={r.status}
                            color={r.status === "AVAILABLE" ? "success" : "default"}
                            sx={{ fontSize: "0.65rem", height: 20 }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.guests.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1">
                        Guests
                      </div>
                      {searchResults.guests.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                          onClick={() => {
                            navigate(`${AppEndPoints.GUEST_LIST}?q=${encodeURIComponent(g.phone)}`);
                            setQ("");
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <MdPerson className="text-slate-600" size={16} />
                            <div>
                              <div className="font-semibold text-slate-900">{g.name}</div>
                              <div className="text-[10px] text-slate-500">{g.phone}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-600 font-bold">View CRM →</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.bookings.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1">
                        Advance Bookings
                      </div>
                      {searchResults.bookings.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                          onClick={() => {
                            navigate(AppEndPoints.RESERVATIONS);
                            setQ("");
                          }}
                        >
                          <div>
                            <div className="font-mono font-bold text-slate-900">{b.bookingNo}</div>
                            <div className="text-slate-700">{b.guestName}</div>
                          </div>
                          <Chip
                            size="small"
                            label={b.status}
                            color="info"
                            sx={{ fontSize: "0.65rem", height: 20 }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Right: Live Ticker, UPI QR, Actions & Clock */}
        <Box className="flex items-center gap-3">
          {/* Live Occupancy Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">Occupancy:</span>
            <span className="font-mono font-bold text-slate-900">{occupancyRate}%</span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-emerald-700">{availableCount} Free</span>
          </div>

          {/* Instant UPI QR Code Button */}
          <button
            type="button"
            onClick={() => setShowUpiModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MdQrCodeScanner size={15} className="text-slate-500" />
            <span>UPI QR</span>
          </button>

          {/* Empty Rooms Warning / Quick Seed Button */}
          {rooms.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDemo}
              disabled={loadingDemo}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs hover:bg-amber-100 transition-all cursor-pointer animate-pulse"
            >
              <MdRefresh size={15} className={loadingDemo ? "animate-spin" : ""} />
              <span>{loadingDemo ? "Loading Demo..." : "⚡ Load Demo Data"}</span>
            </button>
          )}

          {/* Quick Action Button */}
          <button
            type="button"
            onClick={(e) => setActionAnchor(e.currentTarget)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MdAdd size={16} />
            <span>Quick Action</span>
          </button>

          <Menu
            anchorEl={actionAnchor}
            open={Boolean(actionAnchor)}
            onClose={() => setActionAnchor(null)}
            PaperProps={{ sx: { minWidth: 220, borderRadius: "10px", mt: 1, boxShadow: 3 } }}
          >
            <MenuItem
              onClick={() => {
                navigate(AppEndPoints.CHECK_IN);
                setActionAnchor(null);
              }}
            >
              <ListItemIcon>
                <MdLogin className="text-emerald-600" size={20} />
              </ListItemIcon>
              <ListItemText primary="New Check-In" secondary="Instant guest arrival" />
            </MenuItem>

            <MenuItem
              onClick={() => {
                navigate(AppEndPoints.RESERVATIONS);
                setActionAnchor(null);
              }}
            >
              <ListItemIcon>
                <MdCalendarMonth className="text-indigo-600" size={20} />
              </ListItemIcon>
              <ListItemText primary="New Reservation" secondary="Advance booking" />
            </MenuItem>

            <MenuItem
              onClick={() => {
                navigate(AppEndPoints.POS_SERVICES);
                setActionAnchor(null);
              }}
            >
              <ListItemIcon>
                <MdRoomService className="text-amber-600" size={20} />
              </ListItemIcon>
              <ListItemText primary="Room Service Order" secondary="F&B or laundry order" />
            </MenuItem>

            <MenuItem
              onClick={() => {
                navigate(AppEndPoints.EXPENSES);
                setActionAnchor(null);
              }}
            >
              <ListItemIcon>
                <MdAccountBalanceWallet className="text-rose-600" size={20} />
              </ListItemIcon>
              <ListItemText primary="Record Expense" secondary="Petty cash or bills" />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleLoadDemo();
                setActionAnchor(null);
              }}
            >
              <ListItemIcon>
                <MdRefresh className="text-amber-600" size={20} />
              </ListItemIcon>
              <ListItemText primary="Reset / Reload Demo Data" secondary="Populate 15 rooms, stays & orders" />
            </MenuItem>
          </Menu>

          {/* Live Clock */}
          <Box className="hidden sm:block text-right pl-1 border-l border-gray-200">
            <Typography variant="subtitle2" fontWeight={800} className="text-slate-900 leading-tight">
              {dayjs(now).format("hh:mm A")}
            </Typography>
            <Typography variant="caption" className="text-gray-400 block leading-none text-[11px]">
              {dayjs(now).format("ddd, DD MMM")}
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      {/* Global UPI QR Modal */}
      <UpiQrModal
        open={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        hotelName={settings?.hotelName || "Grand Horizon Hotel"}
        upiId={settings?.upiId || "grandhorizon@okaxis"}
        amount={1000}
        description="Hotel Counter Payment"
      />
    </>
  );
}
