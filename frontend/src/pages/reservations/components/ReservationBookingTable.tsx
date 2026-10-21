import { Box, Button, Chip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Calendar, CheckCircle2, LogIn } from "lucide-react";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import { formatCurrency } from "../../../utils/helper/helper";
import type { Reservation, RoomType } from "../../../utils/interfaces/Interface";
import { SOURCE_LABELS, STATUS_COLORS } from "./reservationConfig";

interface ReservationBookingTableProps {
  reservations: Reservation[];
  roomTypes: RoomType[];
  onCheckIn: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
}

export default function ReservationBookingTable({ reservations, roomTypes, onCheckIn, onCancel }: ReservationBookingTableProps) {
  if (!reservations.length) {
    return (
      <Box className="py-12 text-center text-gray-400">
        <Calendar size={48} className="mx-auto mb-2 opacity-40" />
        <Typography variant="body1" fontWeight={600}>No reservations found</Typography>
        <Typography variant="caption">Create an advance booking for an upcoming guest</Typography>
      </Box>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="md:overflow-x-auto">
        <table className="data-table w-full text-left text-sm md:min-w-[860px]">
          <thead className="bg-slate-50">
            <tr className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <th className="px-3 py-3">Booking #</th><th className="px-3 py-3">Guest Details</th><th className="px-3 py-3">Dates & Nights</th><th className="px-3 py-3">Room / Category</th><th className="px-3 py-3">Channel Source</th><th className="px-3 py-3">Advance / Total</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => {
              const source = SOURCE_LABELS[reservation.source] || { label: reservation.source, color: "#64748B" };
              return (
                <tr key={reservation.id} className="border-t border-slate-100">
                  <td data-label="Booking" className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">{reservation.bookingNo}</td>
                  <td data-label="Guest" className="px-4 py-3"><div className="font-semibold text-gray-900">{reservation.guestName}</div><div className="text-xs text-gray-500">{reservation.guestPhone}</div></td>
                  <td data-label="Dates" className="px-4 py-3"><div className="font-medium text-slate-800">{dayjs(reservation.checkInDate).format("DD MMM")} → {dayjs(reservation.checkOutDate).format("DD MMM YYYY")}</div><div className="text-xs font-semibold text-brand-600">{reservation.nights} {reservation.nights === 1 ? "night" : "nights"}</div></td>
                  <td data-label="Room" className="px-4 py-3"><div className="flex items-center gap-2.5"><RoomPhoto roomType={roomTypes.find((type) => type.id === reservation.roomTypeId)} className="h-10 w-14 shrink-0 rounded-lg shadow-2xs" aspectRatio="video" enableZoom /><div><div className="font-semibold text-slate-900">{reservation.roomTypeName}</div><div className="text-xs text-gray-400">{reservation.roomNumber ? `Assigned: Room ${reservation.roomNumber}` : "Room to be assigned"}</div></div></div></td>
                  <td data-label="Channel" className="px-4 py-3"><span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${source.color}18`, color: source.color }}>{source.label}</span></td>
                  <td data-label="Amount" className="px-4 py-3"><div className="font-bold text-gray-900">{formatCurrency(reservation.totalAmount)}</div><div className="text-xs font-semibold text-emerald-600">Advance: {formatCurrency(reservation.advanceAmount)} ({reservation.paymentMode})</div></td>
                  <td data-label="Status" className="px-4 py-3"><Chip size="small" label={reservation.status.replace("_", " ")} color={STATUS_COLORS[reservation.status]} sx={{ fontSize: "0.75rem", fontWeight: 700 }} /></td>
                  <td data-label="Actions" className="px-4 py-3 text-right">
                    <Box className="flex items-center justify-end gap-1.5">
                      {reservation.status === "CONFIRMED" && <>
                        <Button size="small" variant="contained" color="success" startIcon={<LogIn size={15} />} onClick={() => onCheckIn(reservation)} sx={{ textTransform: "none", fontWeight: 700 }}>Check In</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => onCancel(reservation)} sx={{ minWidth: 32, textTransform: "none" }}>Cancel</Button>
                      </>}
                      {reservation.status === "CHECKED_IN" && <Chip size="small" icon={<CheckCircle2 size={14} />} label="In-House Stay" color="success" variant="outlined" />}
                    </Box>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
