import { Box } from "@mui/material";
import dayjs, { type Dayjs } from "dayjs";
import SectionBox from "../../../components/ui/container/SectionBox";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import type { Reservation, Room, RoomType } from "../../../utils/interfaces/Interface";

interface ReservationCalendarProps {
  dates: Dayjs[];
  rooms: Room[];
  roomTypes: RoomType[];
  reservations: Reservation[];
  onCheckIn: (reservation: Reservation) => void;
  onBook: (room: Room, checkInDate: string, checkOutDate: string) => void;
}

export default function ReservationCalendar({ dates, rooms, roomTypes, reservations, onCheckIn, onBook }: ReservationCalendarProps) {
  return (
    <SectionBox className="!overflow-hidden !p-0">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">14-day availability</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <Legend color="bg-emerald-500" label="Open" /><Legend color="bg-brand-600" label="Booked" /><Legend color="bg-rose-500" label="In house" />
        </div>
      </div>
      <Box className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead><tr className="border-b bg-slate-100">
            <th className="sticky left-0 z-10 min-w-[168px] border-r border-slate-200 bg-slate-100 p-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Room</th>
            {dates.map((date) => <th key={date.format("YYYY-MM-DD")} className={`min-w-[75px] border-r p-2 text-center ${date.isSame(dayjs(), "day") ? "bg-amber-100 font-extrabold text-amber-900" : "text-slate-600"}`}><div>{date.format("ddd")}</div><div className="text-sm font-bold">{date.format("DD MMM")}</div></th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-200">
            {rooms.map((room) => <CalendarRoomRow key={room.id} room={room} dates={dates} roomTypes={roomTypes} reservations={reservations} onCheckIn={onCheckIn} onBook={onBook} />)}
          </tbody>
        </table>
      </Box>
    </SectionBox>
  );
}

type CalendarRoomRowProps = Omit<ReservationCalendarProps, "rooms"> & { room: Room };

function CalendarRoomRow({ room, dates, roomTypes, reservations, onCheckIn, onBook }: CalendarRoomRowProps) {
  const roomType = roomTypes.find((type) => type.id === room.roomTypeId);

  return (
    <tr className="hover:bg-slate-50">
      <td className="sticky left-0 z-10 border-r border-slate-200 bg-white p-3 font-semibold text-slate-800">
        <div className="flex min-w-[170px] items-center gap-2.5">
          <RoomPhoto room={room} roomType={roomType} className="h-10 w-14 shrink-0 rounded-lg shadow-2xs" aspectRatio="video" enableZoom />
          <div><div className="text-sm font-semibold text-slate-900">Room {room.number}</div><div className="mt-0.5 max-w-[100px] truncate text-[11px] font-medium leading-4 text-slate-500">{roomType?.name || "Standard"}</div></div>
        </div>
      </td>
      {dates.map((date) => {
        const dateString = date.format("YYYY-MM-DD");
        const booking = reservations.find((reservation) => {
          if (["CANCELLED", "NO_SHOW"].includes(reservation.status)) return false;
          const matchesRoom = reservation.roomId === room.id || (!reservation.roomId && reservation.roomTypeId === room.roomTypeId);
          return matchesRoom && dateString >= reservation.checkInDate && dateString < reservation.checkOutDate;
        });
        const occupiedToday = date.isSame(dayjs(), "day") && room.status === "OCCUPIED";

        return <td key={dateString} className="border-r p-1 text-center align-middle">
          {occupiedToday ? <div className="truncate rounded bg-rose-500 p-1 text-[10px] font-bold text-white shadow-xs" title="Currently Occupied">In-House</div>
            : booking ? <button type="button" className="w-full truncate rounded bg-brand-600 p-1 text-[10px] font-semibold text-white shadow-xs hover:bg-brand-700" title={`${booking.guestName} (${booking.bookingNo}) - ${booking.source}`} onClick={() => onCheckIn(booking)}>{booking.guestName.split(" ")[0]}</button>
              : <button type="button" className="h-6 w-full rounded bg-emerald-50 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100" onClick={() => onBook(room, dateString, date.add(2, "day").format("YYYY-MM-DD"))}>+ Book</button>}
        </td>;
      })}
    </tr>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>;
}
