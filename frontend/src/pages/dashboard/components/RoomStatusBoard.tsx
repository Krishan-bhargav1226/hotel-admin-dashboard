import { useMemo, useState } from "react";
import { BedDouble, Search } from "lucide-react";
import type { Room, RoomStatus, RoomType, Stay } from "../../../utils/interfaces/Interface";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { Skeleton } from "../../../components/ui/skeleton";
import RoomTile, { type RoomHold } from "./RoomTile";

export type RoomBoardFilter = RoomStatus | "ALL" | "DEPARTING";

interface RoomStatusBoardProps {
  rooms: Room[];
  roomTypes: RoomType[];
  floors: [string, Room[]][];
  activeByRoom: Map<string, Stay>;
  reservedByRoom: Map<string, RoomHold>;
  counts: Record<RoomStatus, number>;
  departingCount?: number;
  filter: RoomBoardFilter;
  onFilter: (value: RoomBoardFilter) => void;
  isLoading: boolean;
  canManageProperty: boolean;
  onLoadDemo: () => void;
  loadingDemo: boolean;
  onAddRooms: () => void;
  now: number;
  onCheckIn: (room: Room) => void;
  onOpenStay: (stay: Stay) => void;
  onCheckOut: (stay: Stay) => void;
  onOrderService: () => void;
  onSetStatus: (roomId: string, status: RoomStatus) => void;
}

const FILTERS: { status: RoomBoardFilter; label: string; tone: string }[] = [
  { status: "ALL", label: "All", tone: "text-slate-900" },
  { status: "AVAILABLE", label: "Available", tone: "text-emerald-800" },
  { status: "OCCUPIED", label: "Occupied", tone: "text-rose-800" },
  { status: "DEPARTING", label: "Departing Today", tone: "text-amber-800" },
  { status: "CLEANING", label: "Cleaning", tone: "text-amber-800" },
  { status: "MAINTENANCE", label: "Maintenance", tone: "text-slate-800" },
];

export default function RoomStatusBoard(props: RoomStatusBoardProps) {
  const { rooms, roomTypes, floors, activeByRoom, reservedByRoom, counts, departingCount = 0, filter, onFilter, isLoading, canManageProperty, onLoadDemo, loadingDemo, onAddRooms, now, onCheckIn, onOpenStay, onCheckOut, onOrderService, onSetStatus } = props;
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visibleFloors = useMemo(() => floors.map(([floor, list]) => {
    const roomsOnFloor = list.filter((room) => {
      if (!needle) return true;
      const stay = activeByRoom.get(room.id);
      const hold = reservedByRoom.get(room.id);
      const typeName = roomTypes.find((type) => type.id === room.roomTypeId)?.name ?? "";
      return [room.number, room.floor, typeName, room.status, stay?.guestName, stay?.guestPhone, hold?.guestName, hold?.guestPhone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return [floor, roomsOnFloor] as [string, Room[]];
  }).filter(([, list]) => list.length > 0), [floors, needle, activeByRoom, reservedByRoom, roomTypes]);

  return <section aria-labelledby="room-status-heading" className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-panel sm:p-6">
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="room-status-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Room status</h2><p className="mt-0.5 text-xs text-slate-500">Who is in, which rooms are free, and who should leave soon</p></div>
        <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:max-w-xs dark:border-slate-700 dark:bg-slate-900">
          <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Room, guest, or phone" aria-label="Search rooms" className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100" />
        </label>
      </div>
      <div role="group" aria-label="Filter rooms by status" className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800">
        {FILTERS.map(({ status, label, tone }) => <button key={status} type="button" onClick={() => onFilter(status)} aria-pressed={filter === status} className={`min-h-11 shrink-0 cursor-pointer rounded-lg px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${filter === status ? `bg-white ${tone} font-bold shadow-2xs dark:bg-slate-900` : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}>{label} ({status === "ALL" ? rooms.length : status === "DEPARTING" ? departingCount : counts[status]})</button>)}
      </div>
    </div>
    {isLoading && rooms.length === 0 && <div role="status" aria-label="Loading room status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><span className="sr-only">Loading room status</span>{Array.from({ length: 4 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-[var(--border)] p-3"><Skeleton className="aspect-[16/8] w-full rounded-xl" /><Skeleton className="mt-4 h-4 w-2/3" /><Skeleton className="mt-2 h-3 w-1/2" /><Skeleton className="mt-5 h-9 w-full rounded-lg" /></div>)}</div>}
    {!isLoading && rooms.length === 0 && <div className="mx-auto max-w-lg py-12 text-center sm:py-16"><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><BedDouble className="size-5" aria-hidden="true" /></div><h3 className="text-base font-semibold text-slate-900">Add your first room</h3><p className="mb-5 mt-1 text-sm leading-6 text-slate-600">{canManageProperty ? "Set up your room inventory to start tracking arrivals, stays, and housekeeping." : "Ask a manager to add rooms before you can check guests in."}</p>{canManageProperty ? <div className="flex flex-wrap items-center justify-center gap-2"><UISubmitButton type="button" text="Load sample data" loading={loadingDemo} onClick={onLoadDemo} /><UISubmitButton type="button" variant="outlined" text="Add rooms" onClick={onAddRooms} /></div> : null}</div>}
    {!isLoading && rooms.length > 0 && visibleFloors.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No rooms match that search.</p>}
    {visibleFloors.map(([floor, roomsOnFloor]) => <div key={floor} className="mb-6 last:mb-0">
      <div className="mb-3 flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-slate-400" /><span className="text-xs font-bold uppercase tracking-wider text-slate-700">{floor}</span><span className="text-[11px] font-medium text-slate-400">({roomsOnFloor.length} rooms)</span><div className="ml-2 h-px flex-1 bg-slate-100" /></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {roomsOnFloor.map((room) => {
          const stay = activeByRoom.get(room.id);
          return <RoomTile key={room.id} room={room} roomTypeName={roomTypes.find((type) => type.id === room.roomTypeId)?.name ?? "Standard"} stay={stay} reservation={reservedByRoom.get(room.id)} now={now} onCheckIn={() => onCheckIn(room)} onOpenStay={() => stay && onOpenStay(stay)} onCheckOut={() => stay && onCheckOut(stay)} onOrderService={onOrderService} onSetStatus={(status) => onSetStatus(room.id, status)} />;
        })}
      </div>
    </div>)}
  </section>;
}
