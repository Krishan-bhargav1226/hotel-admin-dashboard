import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import { getRoomMeta } from "../../../utils/helper/roomImages";
import type { RoomType } from "../../../utils/interfaces/Interface";

export default function RoomTypePreview({ values, id }: { values: Partial<RoomType>; id?: string }) {
  const meta = getRoomMeta(null, { ...values, id });
  return <div className="overflow-hidden rounded-xl border border-slate-200">
    <RoomPhoto src={values.image || undefined} roomType={{ ...values, id: id || "preview" } as RoomType} aspectRatio="video" showBadge className="h-36 w-full" />
    <div className="border-t border-slate-200 bg-slate-50 p-2.5 text-xs"><span className="font-semibold text-slate-800">{values.name || "Room Type Preview"}</span><span className="block text-[11px] text-slate-500">{values.suitableFor || meta.guestTypeLabel} · {values.bedConfig || meta.bedConfig}</span></div>
  </div>;
}
