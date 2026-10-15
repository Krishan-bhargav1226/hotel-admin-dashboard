import { MdCheckCircle, MdKingBed, MdMeetingRoom, MdPeople, MdSquareFoot } from "react-icons/md";
import { formatCurrency } from "../../../utils/helper/helper";
import type { RoomPhotoMeta } from "../../../utils/helper/roomImages";

interface RoomSpecificationsProps { meta: RoomPhotoMeta; title: string; maxGuests?: number; bedConfig?: string; sizeSqFt?: number; amenities?: string[]; }

export default function RoomSpecifications({ meta, title, maxGuests, bedConfig, sizeSqFt, amenities }: RoomSpecificationsProps) {
  const specs = [
    { label: "Capacity", value: `Max ${maxGuests || meta.maxGuests} Guests`, icon: MdPeople, tone: "bg-brand-50 text-brand-600" },
    { label: "Bedding", value: bedConfig || meta.bedConfig, icon: MdKingBed, tone: "bg-amber-50 text-amber-600" },
    { label: "Room Size", value: `${sizeSqFt || meta.sizeSqFt} sq.ft.`, icon: MdSquareFoot, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Suitability", value: meta.guestTypeLabel, icon: MdMeetingRoom, tone: "bg-rose-50 text-rose-600" },
  ];
  return <div className="p-6">
    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start"><div><div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">Room Specification & Guest Suitability</div><h2 className="mt-0.5 text-xl font-bold text-slate-900">{title}</h2><p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600">{meta.guestDescription}</p></div><div className="shrink-0 text-left sm:text-right"><span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Standard Base Tariff</span><span className="font-mono text-2xl font-bold text-slate-900">{formatCurrency(meta.basePrice)}</span><span className="block text-xs text-slate-500">/ 24h stay</span></div></div>
    <div className="grid grid-cols-2 gap-3 border-b border-slate-100 py-4 sm:grid-cols-4">{specs.map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={18} /></span><div><span className="block text-[10px] font-semibold uppercase text-slate-400">{label}</span><span className="block max-w-[120px] truncate text-xs font-bold text-slate-800">{value}</span></div></div>)}</div>
    <div className="pt-4"><h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Room Amenities & Comforts</h3><div className="flex flex-wrap gap-2">{(amenities || meta.amenities).map((amenity, index) => <span key={`${amenity}-${index}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-100/80 px-3 py-1.5 text-xs font-medium text-slate-700"><MdCheckCircle size={14} className="text-emerald-500" /><span>{amenity}</span></span>)}</div></div>
  </div>;
}
