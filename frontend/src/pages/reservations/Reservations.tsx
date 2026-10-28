import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Calendar, List, UserPlus } from "lucide-react";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import ReservationFormDialog, { type ReservationFormValues } from "./components/ReservationFormDialog";
import CheckInDialog from "./components/CheckInDialog";
import ReservationSummary from "./components/ReservationSummary";
import ReservationListView from "./components/ReservationListView";
import ReservationCalendar from "./components/ReservationCalendar";
import { ShowConfirmModal } from "../../hooks/useShowConfirmModal";
import {
  useConvertReservationToStayMutation,
  useCreateReservationMutation,
  useGetReservationsQuery,
  useUpdateReservationStatusMutation,
} from "../../store/services/reservation/reservationSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { useGetRatePlansQuery } from "../../store/services/rate-plan/ratePlanSlice";
import { getErrorMessage } from "../../utils/helper/helper";
import { getRoomMeta } from "../../utils/helper/roomImages";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import type { BookingSource, PaymentMode, Reservation } from "../../utils/interfaces/Interface";

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
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openNewModal, setOpenNewModal] = useState(false);
  const [checkInTarget, setCheckInTarget] = useState<Reservation | null>(null);
  const [bookingGuestFilter, setBookingGuestFilter] = useState("ALL");
  const [checkInRoomId, setCheckInRoomId] = useState("");
  const [checkInPlanId, setCheckInPlanId] = useState("");
  const [checkInIdType, setCheckInIdType] = useState("AADHAAR");
  const [checkInIdNumber, setCheckInIdNumber] = useState("");
  const [checkInAddress, setCheckInAddress] = useState("");
  const [form, setForm] = useState<ReservationFormValues>({
    guestName: "", guestPhone: "", guestEmail: "", roomTypeId: "", roomId: "",
    checkInDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
    checkOutDate: dayjs().add(3, "day").format("YYYY-MM-DD"),
    totalAmount: 0, advanceAmount: 0, paymentMode: "UPI" as PaymentMode,
    source: "DIRECT" as BookingSource, specialRequests: "",
  });

  const nights = useMemo(() => Math.max(1, dayjs(form.checkOutDate).diff(dayjs(form.checkInDate), "day")), [form.checkInDate, form.checkOutDate]);
  const calendarDates = useMemo(() => Array.from({ length: 14 }, (_, index) => dayjs().add(index, "day")), []);
  const filteredReservations = useMemo(() => reservations.filter((reservation) => {
    const matchesStatus = filterStatus === "ALL" || reservation.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch = reservation.guestName.toLowerCase().includes(query) || reservation.guestPhone.includes(searchQuery) || reservation.bookingNo.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  }), [reservations, filterStatus, searchQuery]);
  const stats = useMemo(() => ({
    total: reservations.length,
    confirmed: reservations.filter((reservation) => reservation.status === "CONFIRMED").length,
    checkedIn: reservations.filter((reservation) => reservation.status === "CHECKED_IN").length,
    advanceSum: reservations.reduce((sum, reservation) => sum + (reservation.advanceAmount || 0), 0),
  }), [reservations]);

  const handleSelectRoomType = (typeId: string) => {
    const meta = getRoomMeta(null, roomTypes.find((type) => type.id === typeId));
    const total = (meta.basePrice || 2800) * nights;
    setForm((current) => ({ ...current, roomTypeId: typeId, totalAmount: total, advanceAmount: Math.round(total * 0.3) }));
  };

  const handleDateChange = (field: "checkInDate" | "checkOutDate", value: string) => {
    const updated = { ...form, [field]: value };
    const count = Math.max(1, dayjs(updated.checkOutDate).diff(dayjs(updated.checkInDate), "day"));
    const meta = getRoomMeta(null, roomTypes.find((type) => type.id === updated.roomTypeId));
    const total = (meta.basePrice || 2800) * count;
    setForm({ ...updated, totalAmount: total, advanceAmount: Math.round(total * 0.3) });
  };

  const handleCreateSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.guestName || !form.guestPhone || !form.roomTypeId) return toast.error("Please fill guest name, phone, and room type");
    try {
      await createReservation({ ...form, nights, totalAmount: Number(form.totalAmount), advanceAmount: Number(form.advanceAmount) }).unwrap();
      toast.success("Advance reservation confirmed!");
      setOpenNewModal(false);
      setForm({ ...form, guestName: "", guestPhone: "", guestEmail: "", roomTypeId: roomTypes[0]?.id || "", roomId: "", checkInDate: dayjs().add(1, "day").format("YYYY-MM-DD"), checkOutDate: dayjs().add(3, "day").format("YYYY-MM-DD"), totalAmount: 0, advanceAmount: 0, paymentMode: "UPI", source: "DIRECT_WALKIN", specialRequests: "" });
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleOpenCheckIn = (reservation: Reservation) => {
    setCheckInTarget(reservation);
    const available = rooms.filter((room) => room.status === "AVAILABLE" && (reservation.roomId ? room.id === reservation.roomId : room.roomTypeId === reservation.roomTypeId));
    setCheckInRoomId(available[0]?.id || rooms.find((room) => room.status === "AVAILABLE")?.id || "");
    setCheckInPlanId(ratePlans[0]?.id || "");
    setCheckInIdType("AADHAAR");
    setCheckInIdNumber("");
    setCheckInAddress("");
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInTarget || !checkInRoomId || !checkInPlanId) return toast.error("Please select a room and rate plan");
    if (!checkInIdNumber.trim()) return toast.error("Government ID document number is mandatory to check in");
    try {
      const stay = await convertReservation({
        reservationId: checkInTarget.id,
        roomId: checkInRoomId,
        planId: checkInPlanId,
        idType: checkInIdType,
        idNumber: checkInIdNumber.trim(),
        address: checkInAddress.trim(),
        guestName: checkInTarget.guestName,
        guestPhone: checkInTarget.guestPhone,
        advanceAmount: checkInTarget.advanceAmount,
        advanceMode: checkInTarget.paymentMode,
      }).unwrap();
      toast.success(`Check-in complete for ${checkInTarget.guestName}! Room assigned: ${stay.roomNumber}`);
      setCheckInTarget(null);
      navigate(AppEndPoints.DASHBOARD);
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleCancel = async (reservation: Reservation) => {
    const ok = await ShowConfirmModal({
      title: `Cancel reservation ${reservation.bookingNo}?`,
      text: `Are you sure you want to cancel the booking for ${reservation.guestName}?`,
      confirmButtonText: "Cancel reservation",
      buttonColor: "red",
    });
    if (!ok) return;
    try {
      await updateStatus({ id: reservation.id, status: "CANCELLED" }).unwrap();
      toast.success("Reservation cancelled");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCalendarBooking = (room: (typeof rooms)[number], checkInDate: string, checkOutDate: string) => {
    setForm((current) => ({ ...current, roomTypeId: room.roomTypeId, roomId: room.id, checkInDate, checkOutDate }));
    setOpenNewModal(true);
  };

  return (
    <MainContainer>
      <PageTitle title={APP_TEXT.titles.RESERVATIONS} subtitle="Advance bookings, channels, and the 14-day room calendar." actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <Button size="small" onClick={() => setViewMode("LIST")} startIcon={<List size={16} />} variant={viewMode === "LIST" ? "contained" : "text"}>List</Button>
            <Button size="small" onClick={() => setViewMode("CALENDAR")} startIcon={<Calendar size={16} />} variant={viewMode === "CALENDAR" ? "contained" : "text"}>Calendar</Button>
          </div>
          <UISubmitButton type="button" color="primary" text="New reservation" startIcon={<UserPlus size={16} />} onClick={() => { if (roomTypes.length && !form.roomTypeId) setForm((current) => ({ ...current, roomTypeId: roomTypes[0].id })); setOpenNewModal(true); }} />
        </div>
      } />
      <ReservationSummary stats={stats} />
      {viewMode === "LIST" ? <ReservationListView reservations={filteredReservations} roomTypes={roomTypes} filterStatus={filterStatus} setFilterStatus={setFilterStatus} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onCheckIn={handleOpenCheckIn} onCancel={handleCancel} /> : <ReservationCalendar dates={calendarDates} rooms={rooms} roomTypes={roomTypes} reservations={reservations} onCheckIn={handleOpenCheckIn} onBook={handleCalendarBooking} />}
      <ReservationFormDialog open={openNewModal} onClose={() => setOpenNewModal(false)} onSubmit={handleCreateSubmit} form={form} setForm={setForm} nights={nights} roomTypes={roomTypes} rooms={rooms} guestFilter={bookingGuestFilter} setGuestFilter={setBookingGuestFilter} onDateChange={handleDateChange} onSelectRoomType={handleSelectRoomType} isCreating={isCreating} />
      <CheckInDialog reservation={checkInTarget} onClose={() => setCheckInTarget(null)} onConfirm={handleConfirmCheckIn} rooms={rooms} roomTypes={roomTypes} ratePlans={ratePlans} roomId={checkInRoomId} setRoomId={setCheckInRoomId} planId={checkInPlanId} setPlanId={setCheckInPlanId} idType={checkInIdType} setIdType={setCheckInIdType} idNumber={checkInIdNumber} setIdNumber={setCheckInIdNumber} address={checkInAddress} setAddress={setCheckInAddress} isConverting={isConverting} />
    </MainContainer>
  );
}
