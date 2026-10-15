import { Box } from "@mui/material";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import RenderTable from "../../../components/tables/RenderTable";
import { TableRow } from "../../../components/tables/TableRow";
import { IconButton } from "../../../components/ui/buttons/IconButton";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import { formatCurrency } from "../../../utils/helper/helper";
import { getRoomMeta } from "../../../utils/helper/roomImages";
import type { RoomType } from "../../../utils/interfaces/Interface";

const COLUMNS = ["Sr No", "Photo & Type", "Category & Guest Suitability", "Bed & Capacity", "Base Rate", "Action"].map((label) => ({ label }));

export default function RoomTypeTable({ types, onEdit, onDelete }: { types: RoomType[]; onEdit: (type: RoomType) => void; onDelete: (type: RoomType) => void }) {
  return <RenderTable columns={COLUMNS}>{types.map((type, index) => {
    const meta = getRoomMeta(null, type);
    return <TableRow key={type.id} itemIndex={index}>
      <td className="rounded-l-lg p-3 font-mono text-xs text-slate-400">{index + 1}</td>
      <td className="p-3"><div className="flex items-center gap-3"><RoomPhoto roomType={type} src={type.image} aspectRatio="video" className="h-12 w-20 shrink-0 rounded-lg shadow-xs" enableZoom /><div><span className="block text-sm font-bold text-slate-900">{type.name}</span><span className="font-mono text-[11px] text-slate-400">{type.sizeSqFt || meta.sizeSqFt} sq.ft</span></div></div></td>
      <td className="p-3"><span className="inline-block rounded-full border border-brand-200/60 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">{type.badge || meta.badge}</span><span className="mt-0.5 block text-xs text-slate-500">{type.suitableFor || meta.guestTypeLabel}</span></td>
      <td className="p-3 text-xs"><div className="font-medium text-slate-800">{type.bedConfig || meta.bedConfig}</div><div className="text-[11px] text-slate-400">Up to {type.maxGuests || meta.maxGuests} Guests</div></td>
      <td className="p-3"><span className="font-mono text-xs font-bold text-slate-900">{formatCurrency(type.basePrice || meta.basePrice)}</span><span className="block text-[10px] text-slate-400">per night</span></td>
      <td className="rounded-r-lg p-3"><Box className="flex gap-1"><IconButton tooltip="Edit" icon={<FaPenToSquare size={15} />} bgColor="GREEN" onClick={() => onEdit(type)} /><IconButton tooltip="Delete" icon={<FaTrashAlt size={15} />} onClick={() => onDelete(type)} /></Box></td>
    </TableRow>;
  })}</RenderTable>;
}
