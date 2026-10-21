import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import RoomStatusBadge, { type DisplayRoomStatus } from "../../../components/ui/room/RoomStatusBadge";
import type { Room } from "../../../utils/interfaces/Interface";
import { getRoomMeta } from "../../../utils/helper/roomImages";

export default function RoomTilePhoto({ room, roomTypeName, displayStatus }: { room: Room; roomTypeName: string; displayStatus: DisplayRoomStatus }) {
  const meta = getRoomMeta(room, null);
  return <div className="relative aspect-[16/8] w-full overflow-hidden bg-slate-100">
    <RoomPhoto room={room} aspectRatio="auto" className="h-full w-full rounded-none" enableZoom />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
    <div className="pointer-events-none absolute left-2.5 right-2.5 top-2 flex items-center justify-between"><div className="flex items-center gap-1.5"><span className="rounded bg-black/60 px-2 py-0.5 font-mono text-xs font-extrabold text-white shadow-xs backdrop-blur-md">Room {room.number}</span><span className="rounded bg-white/90 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-800 shadow-xs backdrop-blur-md">{room.floor}</span></div><RoomStatusBadge status={displayStatus} /></div>
    <div className="pointer-events-none absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between"><span className="max-w-[130px] truncate text-[11px] font-bold text-white drop-shadow">{roomTypeName}</span><span className="max-w-[120px] truncate text-[10px] font-semibold text-white/90 drop-shadow">{meta.badge}</span></div>
  </div>;
}
