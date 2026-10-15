import type { Room, RoomType, RoomStatus } from "../../utils/interfaces/Interface";
import RoomInventoryCard from "./RoomInventoryCard";

interface RoomInventoryGridProps { loading: boolean; rooms: Room[]; types: RoomType[]; floors: [string, Room[]][]; onStatusChange: (room: Room, status: RoomStatus) => void; onEdit: (room: Room) => void; onDelete: (room: Room) => void; }

export default function RoomInventoryGrid({ loading, rooms, types, floors, onStatusChange, onEdit, onDelete }: RoomInventoryGridProps) {
  if (loading) return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>;
  if (rooms.length === 0) return <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">No rooms match the selected guest filter.</div>;
  return <div className="space-y-8">{floors.map(([floor, floorRooms]) => <section key={floor}>
    <div className="mb-3.5 flex items-baseline justify-between border-b border-slate-200/80 pb-2"><div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-slate-800" /><h2 className="text-sm font-bold tracking-tight text-slate-900">{floor === "Unassigned" ? "Unassigned Floor" : /^floor/i.test(floor) ? floor : `Floor ${floor}`}</h2></div><span className="text-xs font-semibold text-slate-500">{floorRooms.length} rooms</span></div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{floorRooms.map((room) => <RoomInventoryCard key={room.id} room={room} roomType={types.find((type) => type.id === room.roomTypeId)} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />)}</div>
  </section>)}</div>;
}
