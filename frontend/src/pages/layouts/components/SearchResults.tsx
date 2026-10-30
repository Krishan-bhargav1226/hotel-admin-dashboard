import { BedDouble, KeyRound, UserRound } from "lucide-react";
import { buildPath } from "../../../utils/helper/helper";
import { AppEndPoints } from "../../../utils/route-endpoints/AppEndPoints";
import type { Guest, Reservation, Room, Stay } from "../../../utils/interfaces/Interface";

interface SearchResultsProps {
  results: { rooms: Room[]; guests: Guest[]; bookings: Reservation[]; stays: Stay[] };
  onNavigate: (path: string) => void;
}

export default function SearchResults({ results, onNavigate }: SearchResultsProps) {
  const hasResults = results.rooms.length + results.guests.length + results.bookings.length + results.stays.length > 0;
  if (!hasResults) return <p className="px-4 py-6 text-center text-sm text-slate-500">No matching rooms, guests, or bookings.</p>;

  return <div className="max-h-96 overflow-y-auto p-2">
    <ResultGroup title="Rooms">{results.rooms.map((room) => <ResultButton key={room.id} onClick={() => onNavigate(AppEndPoints.ROOM_LIST)} leading={<BedDouble className="size-4 text-slate-400" />} label={`Room ${room.number}`} detail={room.status} />)}</ResultGroup>
    <ResultGroup title="Guests">{results.guests.map((guest) => <ResultButton key={guest.id} onClick={() => onNavigate(`${AppEndPoints.GUEST_LIST}?q=${encodeURIComponent(guest.phone)}`)} leading={<UserRound className="size-4 text-slate-400" />} label={guest.name} detail={guest.phone} />)}</ResultGroup>
    <ResultGroup title="Bookings">{results.bookings.map((booking) => <ResultButton key={booking.id} onClick={() => onNavigate(AppEndPoints.RESERVATIONS)} label={booking.bookingNo} detail={`${booking.guestName} · ${booking.status}`} mono />)}</ResultGroup>
    <ResultGroup title="Stays">{results.stays.map((stay) => <ResultButton key={stay.id} onClick={() => onNavigate(buildPath(AppEndPoints.STAY_DETAILS, stay.id))} leading={<KeyRound className="size-4 text-slate-400" />} label={stay.guestName} detail={stay.stayNo} />)}</ResultGroup>
  </div>;
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  return <section><p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>{children}</section>;
}

function ResultButton({ onClick, leading, label, detail, mono = false }: { onClick: () => void; leading?: React.ReactNode; label: string; detail: string; mono?: boolean }) {
  return <button type="button" onMouseDown={onClick} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
    <span className={`inline-flex min-w-0 items-center gap-2 ${mono ? "font-mono text-xs font-semibold" : "font-medium"}`}>{leading}<span className="min-w-0"><span className="block truncate">{label}</span>{leading && <span className="block text-xs font-normal text-slate-500">{detail}</span>}</span></span>
    {!leading && <span className="ml-2 shrink-0 text-xs text-slate-500">{detail}</span>}
  </button>;
}
