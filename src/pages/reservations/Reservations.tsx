import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  MdCalendarMonth,
  MdCheckCircle,
  MdFormatListBulleted,
  MdLogin,
  MdPersonAdd,
  MdSearch,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import SectionBox from "../../components/ui/container/SectionBox";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import UiDialog from "../../components/ui/models/UiDialog";
import {
  useConvertReservationToStayMutation,
  useCreateReservationMutation,
  useGetReservationsQuery,
  useUpdateReservationStatusMutation,
} from "../../store/services/reservation/reservationSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { useGetRatePlansQuery } from "../../store/services/rate-plan/ratePlanSlice";
import { formatCurrency, getErrorMessage } from "../../utils/helper/helper";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import type {
  BookingSource,
  PaymentMode,
  Reservation,
  ReservationStatus,
} from "../../utils/interfaces/Interface";

const SOURCE_LABELS: Record<BookingSource, { label: string; color: string }> = {
  DIRECT_WALKIN: { label: "Direct Walk-in", color: "#10B981" },
  WEBSITE: { label: "Hotel Website", color: "#6366F1" },
  BOOKING_COM: { label: "Booking.com", color: "#003580" },
  MAKEMYTRIP: { label: "MakeMyTrip", color: "#EF4444" },
  AGODA: { label: "Agoda", color: "#8B5CF6" },
  PHONE: { label: "Phone Inquiry", color: "#F59E0B" },
  CORPORATE: { label: "Corporate Desk", color: "#0D9488" },
};

const STATUS_COLORS: Record<ReservationStatus, "success" | "info" | "error" | "default"> = {
  CONFIRMED: "info",
  CHECKED_IN: "success",
  CANCELLED: "error",
  NO_SHOW: "default",
};

export default function Reservations() {
  const navigate = useNavigate();
  const { data: reservations = [] } = useGetReservationsQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: roomTypes = [] } = useGetRoomTypesQuery();
  const { data: ratePlans = [] } = useGetRatePlansQuery();

  const [createReservation, { isLoading: isCreating }] = useCreateReservationMutation();
  const [updateStatus] = useUpdateReservationStatusMutation();
  const [convertReservation, { isLoading: isConverting }] = useConvertReservationToStayMutation();

  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openNewModal, setOpenNewModal] = useState(false);
  const [checkInTarget, setCheckInTarget] = useState<Reservation | null>(null);

  // New Reservation Form State
  const [form, setForm] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    roomTypeId: "",
    roomId: "",
    checkInDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
    checkOutDate: dayjs().add(3, "day").format("YYYY-MM-DD"),
    totalAmount: 4000,
    advanceAmount: 1000,
    paymentMode: "UPI" as PaymentMode,
    source: "BOOKING_COM" as BookingSource,
    specialRequests: "",
  });

  // Check In Modal State
  const [checkInRoomId, setCheckInRoomId] = useState("");
  const [checkInPlanId, setCheckInPlanId] = useState("");
  const [checkInIdType, setCheckInIdType] = useState("AADHAAR");
  const [checkInIdNumber, setCheckInIdNumber] = useState("");
  const [checkInAddress, setCheckInAddress] = useState("");

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
      const matchQuery =
        r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guestPhone.includes(searchQuery) ||
        r.bookingNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [reservations, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
    const checkedIn = reservations.filter((r) => r.status === "CHECKED_IN").length;
    const advanceSum = reservations.reduce((s, r) => s + (r.advanceAmount || 0), 0);
    return { total, confirmed, checkedIn, advanceSum };
  }, [reservations]);

  // Calendar dates: next 14 days
  const calendarDates = useMemo(() => {
    const dates: dayjs.Dayjs[] = [];
    for (let i = 0; i < 14; i++) {
      dates.push(dayjs().add(i, "day"));
    }
    return dates;
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.guestPhone || !form.roomTypeId) {
      toast.error("Please fill guest name, phone, and room type");
      return;
    }
    const nights = Math.max(1, dayjs(form.checkOutDate).diff(dayjs(form.checkInDate), "day"));
    try {
      await createReservation({
        ...form,
        nights,
        totalAmount: Number(form.totalAmount),
        advanceAmount: Number(form.advanceAmount),
      }).unwrap();
      toast.success("Advance reservation confirmed!");
      setOpenNewModal(false);
      setForm({
        guestName: "",
        guestPhone: "",
        guestEmail: "",
        roomTypeId: roomTypes[0]?.id || "",
        roomId: "",
        checkInDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        checkOutDate: dayjs().add(3, "day").format("YYYY-MM-DD"),
        totalAmount: 4000,
        advanceAmount: 1000,
        paymentMode: "UPI",
        source: "BOOKING_COM",
        specialRequests: "",
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleOpenCheckIn = (res: Reservation) => {
    setCheckInTarget(res);
    const available = rooms.filter(
      (r) => r.status === "AVAILABLE" && (res.roomId ? r.id === res.roomId : r.roomTypeId === res.roomTypeId)
    );
    setCheckInRoomId(available[0]?.id || rooms.find((r) => r.status === "AVAILABLE")?.id || "");
    setCheckInPlanId(ratePlans[0]?.id || "");
    setCheckInIdType("AADHAAR");
    setCheckInIdNumber("");
    setCheckInAddress("");
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInTarget || !checkInRoomId || !checkInPlanId) {
      toast.error("Please select a room and rate plan");
      return;
    }
    try {
      const stay = await convertReservation({
        reservationId: checkInTarget.id,
        roomId: checkInRoomId,
        planId: checkInPlanId,
        idType: checkInIdType,
        idNumber: checkInIdNumber || "VERIFIED-ONLINE",
        address: checkInAddress,
      }).unwrap();
      toast.success(`Check-in complete for ${checkInTarget.guestName}! Room assigned: ${stay.roomNumber}`);
      setCheckInTarget(null);
      navigate(AppEndPoints.DASHBOARD);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <MainContainer>
      {/* Header and View Mode Switcher */}
      <Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <PageTitle title={APP_TEXT.titles.RESERVATIONS} />
          <Typography variant="body2" className="text-gray-500">
            Manage advance bookings, OTA channels, and room availability calendar
          </Typography>
        </div>
        <Box className="flex items-center gap-2">
          <Tabs
            value={viewMode}
            onChange={(_e, v) => setViewMode(v)}
            sx={{
              bgcolor: "background.paper",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              minHeight: 40,
              "& .MuiTab-root": { minHeight: 40, py: 1, px: 2, fontWeight: 600, fontSize: "0.85rem" },
            }}
          >
            <Tab icon={<MdFormatListBulleted size={18} />} iconPosition="start" label="List View" value="LIST" />
            <Tab icon={<MdCalendarMonth size={18} />} iconPosition="start" label="Tape Chart Calendar" value="CALENDAR" />
          </Tabs>
          <UISubmitButton
            type="button"
            color="primary"
            text="New Reservation"
            startIcon={<MdPersonAdd size={18} />}
            onClick={() => {
              if (roomTypes.length > 0 && !form.roomTypeId) {
                setForm((prev) => ({ ...prev, roomTypeId: roomTypes[0].id }));
              }
              setOpenNewModal(true);
            }}
          />
        </Box>
      </Box>

      {/* KPI Stats Ribbon */}
      <Box className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
        <SectionBox className="!p-3 border-l-4 border-l-indigo-600 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Total Bookings</Typography>
          <Typography variant="h5" fontWeight={800} className="text-indigo-900">{stats.total}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-sky-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Confirmed & Upcoming</Typography>
          <Typography variant="h5" fontWeight={800} className="text-sky-600">{stats.confirmed}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Checked-In Stays</Typography>
          <Typography variant="h5" fontWeight={800} className="text-emerald-600">{stats.checkedIn}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-amber-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Advance Collected</Typography>
          <Typography variant="h5" fontWeight={800} className="text-amber-600">{formatCurrency(stats.advanceSum)}</Typography>
        </SectionBox>
      </Box>

      {/* VIEW 1: LIST VIEW */}
      {viewMode === "LIST" && (
        <SectionBox className="bg-white shadow-sm rounded-xl">
          {/* Filters Bar */}
          <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 border-b pb-3">
            <Box className="flex items-center gap-2 flex-wrap">
              {["ALL", "CONFIRMED", "CHECKED_IN", "CANCELLED"].map((st) => (
                <Chip
                  key={st}
                  label={st === "ALL" ? "All Bookings" : st.replace("_", " ")}
                  clickable
                  color={filterStatus === st ? "primary" : "default"}
                  variant={filterStatus === st ? "filled" : "outlined"}
                  onClick={() => setFilterStatus(st)}
                  sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                />
              ))}
            </Box>
            <Box className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 w-full sm:w-64">
              <MdSearch className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search guest, phone, ID..."
                className="bg-transparent text-sm outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
          </Box>

          {/* Bookings Table / Cards */}
          {filteredReservations.length === 0 ? (
            <Box className="py-12 text-center text-gray-400">
              <MdCalendarMonth size={48} className="mx-auto mb-2 opacity-40" />
              <Typography variant="body1" fontWeight={600}>No reservations found</Typography>
              <Typography variant="caption">Create an advance booking for an upcoming guest</Typography>
            </Box>
          ) : (
            <Box className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs font-bold uppercase text-gray-500">
                    <th className="py-3 px-3">Booking #</th>
                    <th className="py-3 px-3">Guest Details</th>
                    <th className="py-3 px-3">Dates & Nights</th>
                    <th className="py-3 px-3">Room / Category</th>
                    <th className="py-3 px-3">Channel Source</th>
                    <th className="py-3 px-3">Advance / Total</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReservations.map((res) => {
                    const src = SOURCE_LABELS[res.source] || { label: res.source, color: "#666" };
                    return (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-900">{res.bookingNo}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-gray-900">{res.guestName}</div>
                          <div className="text-xs text-gray-500">{res.guestPhone}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-gray-800">
                            {dayjs(res.checkInDate).format("DD MMM")} → {dayjs(res.checkOutDate).format("DD MMM YYYY")}
                          </div>
                          <div className="text-xs text-indigo-600 font-semibold">{res.nights} {res.nights === 1 ? "night" : "nights"}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium">{res.roomTypeName}</div>
                          <div className="text-xs text-gray-400">
                            {res.roomNumber ? `Assigned: Room ${res.roomNumber}` : "Room to be assigned"}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: src.color }}
                          >
                            {src.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-gray-900">{formatCurrency(res.totalAmount)}</div>
                          <div className="text-xs text-emerald-600 font-semibold">
                            Advance: {formatCurrency(res.advanceAmount)} ({res.paymentMode})
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <Chip
                            size="small"
                            label={res.status.replace("_", " ")}
                            color={STATUS_COLORS[res.status]}
                            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                          />
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Box className="flex items-center justify-end gap-1.5">
                            {res.status === "CONFIRMED" && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<MdLogin size={15} />}
                                  onClick={() => handleOpenCheckIn(res)}
                                  sx={{ textTransform: "none", fontWeight: 700 }}
                                >
                                  Check In
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={async () => {
                                    if (confirm(`Cancel reservation ${res.bookingNo}?`)) {
                                      await updateStatus({ id: res.id, status: "CANCELLED" });
                                      toast.success("Reservation cancelled");
                                    }
                                  }}
                                  sx={{ textTransform: "none", minWidth: 32 }}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {res.status === "CHECKED_IN" && (
                              <Chip
                                size="small"
                                icon={<MdCheckCircle />}
                                label="In-House Stay"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}
        </SectionBox>
      )}

      {/* VIEW 2: INTERACTIVE TAPE CHART CALENDAR */}
      {viewMode === "CALENDAR" && (
        <SectionBox className="bg-white shadow-sm rounded-xl overflow-hidden">
          <Box className="p-3 bg-slate-50 border-b flex items-center justify-between">
            <Typography variant="subtitle1" fontWeight={700} className="text-slate-800">
              14-Day Room Availability & Tape Chart Grid
            </Typography>
            <Box className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Confirmed Booking</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> In-House Occupied</span>
            </Box>
          </Box>

          <Box className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="p-2.5 text-left font-bold text-slate-700 min-w-[130px] sticky left-0 bg-slate-100 z-10 border-r">
                    Room / Type
                  </th>
                  {calendarDates.map((dt) => {
                    const isToday = dt.isSame(dayjs(), "day");
                    return (
                      <th
                        key={dt.format("YYYY-MM-DD")}
                        className={`p-2 text-center min-w-[75px] border-r ${
                          isToday ? "bg-amber-100 text-amber-900 font-extrabold" : "text-slate-600"
                        }`}
                      >
                        <div>{dt.format("ddd")}</div>
                        <div className="text-sm font-bold">{dt.format("DD MMM")}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rooms.map((room) => {
                  const rType = roomTypes.find((t) => t.id === room.roomTypeId);
                  return (
                    <tr key={room.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-indigo-950">Room {room.number}</span>
                          <span className="text-[10px] text-gray-500 font-normal">{rType?.name || "Std"}</span>
                        </div>
                      </td>
                      {calendarDates.map((dt) => {
                        const dateStr = dt.format("YYYY-MM-DD");
                        // Find booking spanning this date
                        const booking = reservations.find((res) => {
                          if (res.status === "CANCELLED" || res.status === "NO_SHOW") return false;
                          const matchesRoom = res.roomId === room.id || (!res.roomId && res.roomTypeId === room.roomTypeId);
                          const isWithin = dateStr >= res.checkInDate && dateStr < res.checkOutDate;
                          return matchesRoom && isWithin;
                        });

                        const isOccupiedToday = dt.isSame(dayjs(), "day") && room.status === "OCCUPIED";

                        return (
                          <td key={dateStr} className="p-1 border-r text-center align-middle">
                            {isOccupiedToday ? (
                              <div className="rounded bg-rose-500 text-white p-1 font-bold shadow-xs truncate text-[10px]" title="Currently Occupied">
                                In-House
                              </div>
                            ) : booking ? (
                              <div
                                className="rounded bg-indigo-600 text-white p-1 font-semibold shadow-xs truncate text-[10px] cursor-pointer hover:bg-indigo-700"
                                title={`${booking.guestName} (${booking.bookingNo}) - ${booking.source}`}
                                onClick={() => handleOpenCheckIn(booking)}
                              >
                                {booking.guestName.split(" ")[0]}
                              </div>
                            ) : (
                              <div className="h-6 rounded bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px] cursor-pointer"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    roomTypeId: room.roomTypeId,
                                    roomId: room.id,
                                    checkInDate: dateStr,
                                    checkOutDate: dt.add(2, "day").format("YYYY-MM-DD"),
                                  }));
                                  setOpenNewModal(true);
                                }}
                              >
                                + Book
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </SectionBox>
      )}

      {/* NEW RESERVATION MODAL */}
      <UiDialog open={openNewModal} onClose={() => setOpenNewModal(false)} title="Create Advance Booking" maxWidth="md">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Guest Full Name *"
              required
              fullWidth
              size="small"
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
            />
            <TextField
              label="Mobile Number *"
              required
              fullWidth
              size="small"
              value={form.guestPhone}
              onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
            />
            <TextField
              label="Email Address (Optional)"
              fullWidth
              size="small"
              type="email"
              value={form.guestEmail}
              onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Booking Channel / Source</InputLabel>
              <Select
                value={form.source}
                label="Booking Channel / Source"
                onChange={(e) => setForm({ ...form, source: e.target.value as BookingSource })}
              >
                <MenuItem value="BOOKING_COM">Booking.com</MenuItem>
                <MenuItem value="MAKEMYTRIP">MakeMyTrip</MenuItem>
                <MenuItem value="AGODA">Agoda</MenuItem>
                <MenuItem value="WEBSITE">Hotel Website Direct</MenuItem>
                <MenuItem value="DIRECT_WALKIN">Direct Walk-in</MenuItem>
                <MenuItem value="PHONE">Phone Inquiry</MenuItem>
                <MenuItem value="CORPORATE">Corporate Tie-up</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormControl fullWidth size="small" required>
              <InputLabel>Room Category *</InputLabel>
              <Select
                value={form.roomTypeId}
                label="Room Category *"
                onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
              >
                {roomTypes.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Specific Room (Optional)</InputLabel>
              <Select
                value={form.roomId}
                label="Specific Room (Optional)"
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              >
                <MenuItem value="">Auto-Assign at Check-in</MenuItem>
                {rooms
                  .filter((r) => !form.roomTypeId || r.roomTypeId === form.roomTypeId)
                  .map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      Room {r.number} ({r.floor})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Check-In Date *"
              type="date"
              required
              fullWidth
              size="small"
              value={form.checkInDate}
              onChange={(e) => setForm({ ...form, checkInDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Check-Out Date *"
              type="date"
              required
              fullWidth
              size="small"
              value={form.checkOutDate}
              onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Total Booking Tariff (₹) *"
              type="number"
              required
              fullWidth
              size="small"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
            />
            <TextField
              label="Advance Paid (₹)"
              type="number"
              fullWidth
              size="small"
              value={form.advanceAmount}
              onChange={(e) => setForm({ ...form, advanceAmount: Number(e.target.value) })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={form.paymentMode}
                label="Payment Mode"
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value as PaymentMode })}
              >
                <MenuItem value="UPI">UPI / QR</MenuItem>
                <MenuItem value="CARD">Debit / Credit Card</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
              </Select>
            </FormControl>
          </div>

          <TextField
            label="Special Requests / Notes"
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="e.g. Airport taxi pickup at 3pm, high floor, non-smoking"
            value={form.specialRequests}
            onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
          />

          <DialogActions className="!px-0 !pt-3">
            <Button onClick={() => setOpenNewModal(false)} color="inherit">Cancel</Button>
            <UISubmitButton type="submit" text="Confirm Reservation" loading={isCreating} />
          </DialogActions>
        </form>
      </UiDialog>

      {/* CHECK-IN CONVERSION MODAL */}
      <UiDialog
        open={!!checkInTarget}
        onClose={() => setCheckInTarget(null)}
        title={`Check-In Guest: ${checkInTarget?.guestName}`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <Box className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-950">
            <div className="font-bold">Booking #{checkInTarget?.bookingNo} · {checkInTarget?.roomTypeName}</div>
            <div className="mt-1">Advance Received: {formatCurrency(checkInTarget?.advanceAmount || 0)} ({checkInTarget?.paymentMode})</div>
            {checkInTarget?.specialRequests && (
              <div className="mt-1 italic text-indigo-700">Note: {checkInTarget.specialRequests}</div>
            )}
          </Box>

          <FormControl fullWidth size="small" required>
            <InputLabel>Assign Room *</InputLabel>
            <Select
              value={checkInRoomId}
              label="Assign Room *"
              onChange={(e) => setCheckInRoomId(e.target.value)}
            >
              {rooms
                .filter((r) => r.status === "AVAILABLE")
                .map((r) => {
                  const t = roomTypes.find((x) => x.id === r.roomTypeId);
                  return (
                    <MenuItem key={r.id} value={r.id}>
                      Room {r.number} - {t?.name} ({r.floor})
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" required>
            <InputLabel>Rate Plan *</InputLabel>
            <Select
              value={checkInPlanId}
              label="Rate Plan *"
              onChange={(e) => setCheckInPlanId(e.target.value)}
            >
              {ratePlans.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} - {formatCurrency(p.rate)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth size="small">
              <InputLabel>ID Document Type</InputLabel>
              <Select
                value={checkInIdType}
                label="ID Document Type"
                onChange={(e) => setCheckInIdType(e.target.value)}
              >
                <MenuItem value="AADHAAR">Aadhaar Card</MenuItem>
                <MenuItem value="PASSPORT">Passport</MenuItem>
                <MenuItem value="DRIVING_LICENSE">Driving License</MenuItem>
                <MenuItem value="VOTER_ID">Voter ID</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="ID Document Number"
              fullWidth
              size="small"
              value={checkInIdNumber}
              onChange={(e) => setCheckInIdNumber(e.target.value)}
            />
          </div>

          <TextField
            label="Residential City / Address"
            fullWidth
            size="small"
            value={checkInAddress}
            onChange={(e) => setCheckInAddress(e.target.value)}
          />

          <DialogActions className="!px-0 !pt-3">
            <Button onClick={() => setCheckInTarget(null)} color="inherit">Cancel</Button>
            <UISubmitButton
              type="button"
              color="success"
              text="Complete Check-In & Handover Key"
              loading={isConverting}
              onClick={handleConfirmCheckIn}
            />
          </DialogActions>
        </div>
      </UiDialog>
    </MainContainer>
  );
}
