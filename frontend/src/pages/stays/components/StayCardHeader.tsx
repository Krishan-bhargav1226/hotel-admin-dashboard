import { CheckCircle2 } from "lucide-react";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import type { Room, Stay } from "../../../utils/interfaces/Interface";

export default function StayCardHeader({ stay, room, active }: { stay: Stay; room?: Room; active: boolean }) {
  return <div className="relative"><RoomPhoto roomNumber={stay.roomNumber} roomTypeName={stay.roomTypeName} category={room?.category} image={room?.image} badge={room?.badge} height="h-32" className="w-full" />
    <div className="absolute right-2.5 top-2.5">{active ? <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200 shadow-sm backdrop-blur-md"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />In-House</span> : <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-md"><CheckCircle2 size={12} className="text-slate-400" />Checked Out</span>}</div>
  </div>;
}
