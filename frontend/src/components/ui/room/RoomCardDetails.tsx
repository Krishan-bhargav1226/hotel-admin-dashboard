import { Info, BedDouble, Users } from "lucide-react";

interface RoomCardDetailsProps {
  name: string;
  recommendedReason?: string;
  description: string;
  maxGuests: number;
  bedType: string;
  selected: boolean;
  onGallery: () => void;
}

export default function RoomCardDetails({ name, recommendedReason, description, maxGuests, bedType, selected, onGallery }: RoomCardDetailsProps) {
  return <div className="flex flex-1 flex-col justify-between p-3.5">
    <div>
      <div className="flex items-center justify-between"><h3 className="truncate text-sm font-bold tracking-tight text-slate-900">{name}</h3></div>
      {recommendedReason && <div className="mt-1 flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700"><Info size={12} className="shrink-0" /><span className="truncate">{recommendedReason}</span></div>}
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{description}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-600">
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5"><Users size={12} className="text-slate-500" /><span>Max {maxGuests}</span></span>
        <span className="inline-flex max-w-[140px] items-center gap-1 truncate rounded bg-slate-100 px-1.5 py-0.5"><BedDouble size={12} className="text-slate-500" /><span>{bedType}</span></span>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
      <button type="button" onClick={(event) => { event.stopPropagation(); onGallery(); }} className="text-[11px] font-semibold text-slate-500 transition-colors hover:text-slate-800">Gallery & Specs</button>
      <span className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${selected ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"}`}>{selected ? "Selected ✓" : "Select Room"}</span>
    </div>
  </div>;
}
