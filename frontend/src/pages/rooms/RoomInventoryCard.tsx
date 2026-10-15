import { MenuItem, Select } from "@mui/material";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import { MdKingBed, MdPeople } from "react-icons/md";
import { IconButton } from "../../components/ui/buttons/IconButton";
import StatusChip from "../../components/ui/badges/StatusChip";
import RoomPhoto from "../../components/ui/room/RoomPhoto";
import { ROOM_STATUS } from "../../utils/helper/constants";
import { getRoomMeta } from "../../utils/helper/roomImages";
import type { Room, RoomStatus, RoomType } from "../../utils/interfaces/Interface";

interface RoomInventoryCardProps { room: Room; roomType?: RoomType; onStatusChange: (room: Room, status: RoomStatus) => void; onEdit: (room: Room) => void; onDelete: (room: Room) => void; }

export default function RoomInventoryCard({ room, roomType, onStatusChange, onEdit, onDelete }: RoomInventoryCardProps) {
  const meta = getRoomMeta(room, roomType);
  return <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-md">
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100"><RoomPhoto room={room} roomType={roomType} aspectRatio="video" showBadge enableZoom className="h-full w-full rounded-none" /></div>
    <div className="flex flex-1 flex-col justify-between p-4"><div>
      <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{roomType?.name ?? "—"}</p><h3 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">Room {room.number}</h3></div>
        {room.status === "OCCUPIED" ? <StatusChip label="Occupied" color={ROOM_STATUS.OCCUPIED.color} /> : <Select size="small" value={room.status} onChange={(event) => onStatusChange(room, event.target.value as RoomStatus)} aria-label={`Status for room ${room.number}`} sx={{ minWidth: 110, borderRadius: "8px", fontSize: 12, backgroundColor: "#f8fafc" }}>{(["AVAILABLE", "CLEANING", "MAINTENANCE"] as RoomStatus[]).map((status) => <MenuItem key={status} value={status}>{ROOM_STATUS[status].label}</MenuItem>)}</Select>}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-600"><span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700"><MdPeople size={13} className="text-slate-400" /><span>Max {meta.maxGuests} Guests</span></span><span className="inline-flex max-w-[150px] items-center gap-1 truncate rounded-md bg-slate-100 px-2 py-0.5 text-slate-700"><MdKingBed size={13} className="text-slate-400" /><span>{room.bedType || meta.bedConfig}</span></span></div>
      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{room.notes || meta.guestDescription}</p>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="font-mono text-[11px] font-bold text-slate-800">{meta.sizeSqFt} sq.ft.</span><div className="flex items-center gap-1.5"><IconButton tooltip="Edit room" icon={<FaPenToSquare size={13} />} bgColor="GREEN" onClick={() => onEdit(room)} /><IconButton tooltip="Delete room" icon={<FaTrashAlt size={13} />} onClick={() => onDelete(room)} /></div></div>
    </div>
  </article>;
}
