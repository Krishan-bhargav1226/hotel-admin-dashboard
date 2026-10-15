import { BedDouble } from "lucide-react";
import type { Room, RoomStatus, RoomType, Stay } from "../../../utils/interfaces/Interface";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { Skeleton } from "../../../components/ui/skeleton";
import RoomTile from "./RoomTile";

interface RoomStatusBoardProps {
  rooms: Room[];
  roomTypes: RoomType[];
  floors: [string, Room[]][];
  activeByRoom: Map<string, Stay>;
  counts: Record<RoomStatus, number>;
  filter: RoomStatus | "ALL";
  onFilter: (value: RoomStatus | "ALL") => void;
  isLoading: boolean;
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

const FILTERS: { status: RoomStatus | "ALL"; label: string; tone: string }[] = [
  { status: "ALL", label: "All", tone: "text-slate-900" },
  { status: "AVAILABLE", label: "Available", tone: "text-emerald-800" },
  { status: "OCCUPIED", label: "Occupied", tone: "text-rose-800" },
  { status: "CLEANING", label: "Cleaning", tone: "text-amber-800" },
  { status: "MAINTENANCE", label: "Maintenance", tone: "text-slate-800" },
];

export default function RoomStatusBoard(props: RoomStatusBoardProps) {
  const { rooms, roomTypes, floors, activeByRoom, counts, filter, onFilter, isLoading, onLoadDemo, loadingDemo, onAddRooms, now, onCheckIn, onOpenStay, onCheckOut, onOrderService, onSetStatus } = props;
  return <section aria-labelledby="room-status-heading" className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-panel sm:p-6">
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 id="room-status-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Room status</h2><p className="mt-0.5 text-xs text-slate-500">Current guests, room readiness, and check-out times</p></div>
      <div role="group" aria-label="Filter rooms by status" className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800">
        {FILTERS.map(({ status, label, tone }) => <button key={status} type="button" onClick={() => onFilter(status)} aria-pressed={filter === status} className={`h-9 shrink-0 cursor-pointer rounded-lg px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${filter === status ? `bg-white ${tone} font-bold shadow-2xs` : "text-slate-600 hover:text-slate-900"}`}>{label} ({status === "ALL" ? rooms.length : counts[status]})</button>)}
      </div>
    </div>
    {isLoading && rooms.length === 0 && <div role="status" aria-label="Loading room status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><span className="sr-only">Loading room status</span>{Array.from({ length: 4 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-[var(--border)] p-3"><Skeleton className="aspect-[16/8] w-full rounded-xl" /><Skeleton className="mt-4 h-4 w-2/3" /><Skeleton className="mt-2 h-3 w-1/2" /><Skeleton className="mt-5 h-9 w-full rounded-lg" /></div>)}</div>}
    {!isLoading && rooms.length === 0 && <div className="mx-auto max-w-lg py-12 text-center sm:py-16"><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><BedDouble className="size-5" aria-hidden="true" /></div><h3 className="text-base font-semibold text-slate-900">Add your first room</h3><p className="mb-5 mt-1 text-sm leading-6 text-slate-600">Set up your room inventory to start tracking arrivals, stays, and housekeeping.</p><div className="flex flex-wrap items-center justify-center gap-2"><UISubmitButton type="button" text="Load sample data" loading={loadingDemo} onClick={onLoadDemo} /><UISubmitButton type="button" variant="outlined" text="Add rooms" onClick={onAddRooms} /></div></div>}
    {floors.map(([floor, roomsOnFloor]) => <div key={floor} className="mb-6 last:mb-0">
      <div className="mb-3 flex items-center gap-2"><span className="inline-block size-1.5 rounded-full bg-slate-400" /><span className="text-xs font-bold uppercase tracking-wider text-slate-700">{floor}</span><span className="text-[11px] font-medium text-slate-400">({roomsOnFloor.length} rooms)</span><div className="ml-2 h-px flex-1 bg-slate-100" /></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {roomsOnFloor.map((room) => {
          const stay = activeByRoom.get(room.id);
          return <RoomTile key={room.id} room={room} roomTypeName={roomTypes.find((type) => type.id === room.roomTypeId)?.name ?? "Standard"} stay={stay} now={now} onCheckIn={() => onCheckIn(room)} onOpenStay={() => stay && onOpenStay(stay)} onCheckOut={() => stay && onCheckOut(stay)} onOrderService={onOrderService} onSetStatus={(status) => onSetStatus(room.id, status)} />;
        })}
      </div>
    </div>)}
  </section>;
}
