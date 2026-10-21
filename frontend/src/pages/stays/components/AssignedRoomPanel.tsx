import { Box } from "@mui/material";
import { Images } from "lucide-react";
import BoxTitle from "../../../components/ui/container/BoxTitle";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import { describePlan } from "../../../utils/helper/billing";
import { formatDateTime } from "../../../utils/date/dateUtils";
import type { BillBreakdown, Room, Stay } from "../../../utils/interfaces/Interface";
import type { RoomPhotoMeta } from "../../../utils/helper/roomImages";
import { formatCurrency, formatDuration } from "../../../utils/helper/helper";

interface AssignedRoomPanelProps {
  stay: Stay;
  room?: Room;
  roomMeta: RoomPhotoMeta;
  bill: BillBreakdown | null;
  onOpenGallery: () => void;
}

export default function AssignedRoomPanel({ stay, room, roomMeta, bill, onOpenGallery }: AssignedRoomPanelProps) {
  const amenities = room?.amenities || roomMeta.amenities;

  return (
    <BoxTitle title="Assigned Room & Specifications">
      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        <div className="relative">
          <RoomPhoto roomNumber={stay.roomNumber} roomTypeName={stay.roomTypeName} category={room?.category || roomMeta.category} image={room?.image || roomMeta.image} badge={room?.badge || roomMeta.badge} height="h-52" className="w-full" />
          <button type="button" onClick={onOpenGallery} className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-md transition-colors hover:bg-slate-900"><Images size={15} /><span>View Room Angles</span></button>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div><h3 className="font-mono text-xl font-bold text-slate-900">Room {stay.roomNumber} · {stay.roomTypeName}</h3><p className="mt-0.5 text-xs text-slate-500">{room?.floor || "Floor 1"} · {roomMeta.suitableFor || "All Guest Types"}</p></div>
            {(room?.badge || roomMeta.badge) && <span className="rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{room?.badge || roomMeta.badge}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Spec label="Bed Layout" value={room?.bedConfig || roomMeta.bedConfig || "King Size Bed"} />
            <Spec label="Max Capacity" value={`Up to ${room?.maxGuests || roomMeta.maxGuests || 2} Guests`} />
            <Spec label="Room Size" value={`${room?.sizeSqFt || roomMeta.sizeSqFt || 320} sq.ft`} />
            <Spec label="Floor Level" value={room?.floor || "Floor 1"} />
          </div>
          {amenities.length > 0 && <div><span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Room Amenities Included</span><div className="flex flex-wrap gap-1.5">{amenities.map((amenity, index) => <span key={`${amenity}-${index}`} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{amenity}</span>)}</div></div>}
          <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
            <InfoRow label="Tariff Plan" value={`${stay.plan.name} — ${describePlan(stay.plan)}`} />
            {(stay.roomIds?.length ?? 0) > 1 ? <InfoRow label="Rooms Booked" value={stay.roomNumber} /> : null}
            <InfoRow label="Check-In Timestamp" value={formatDateTime(stay.checkInAt)} />
            {stay.expectedCheckOutAt && <InfoRow label="Expected Departure" value={formatDateTime(stay.expectedCheckOutAt)} />}
            {stay.checkOutAt && <InfoRow label="Checked Out At" value={formatDateTime(stay.checkOutAt)} />}
            <InfoRow label="Duration" value={bill ? formatDuration(bill.elapsedMinutes) : "-"} />
            <InfoRow label="Advance Paid at Check-In" value={`${formatCurrency(stay.advanceAmount)} (${stay.advanceMode})`} />
            {stay.notes && <InfoRow label="Folio Notes" value={stay.notes} />}
          </div>
        </div>
      </div>
    </BoxTitle>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-center"><span className="block text-[10px] font-semibold uppercase text-slate-400">{label}</span><span className="mt-0.5 block truncate text-xs font-bold text-slate-800">{value}</span></div>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <Box className="flex justify-between gap-4 py-1 text-sm"><span className="text-gray-500">{label}</span><span className="text-right font-semibold">{value}</span></Box>;
}
