import { MdCheckCircle, MdPhotoLibrary } from "react-icons/md";

interface RoomCardPhotoProps {
  number: string | number;
  floor: string | number;
  photo: string;
  badge: string;
  badgeColor: string;
  price: string;
  selected: boolean;
  onGallery: () => void;
}

export default function RoomCardPhoto({ number, floor, photo, badge, badgeColor, price, selected, onGallery }: RoomCardPhotoProps) {
  return <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
    <img src={photo} alt={`Room ${number}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
    <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="rounded-lg bg-slate-900/90 px-2.5 py-1 font-mono text-xs font-extrabold text-white shadow-xs backdrop-blur-md">Room {number}</span>
        <span className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-800 shadow-xs backdrop-blur-md">{floor}</span>
      </div>
      {selected ? <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-white shadow-md"><MdCheckCircle size={18} className="text-emerald-400" /></span> : <button type="button" onClick={(event) => { event.stopPropagation(); onGallery(); }} className="flex cursor-pointer items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md transition-all hover:bg-black/60" title="View photo gallery"><MdPhotoLibrary size={12} /><span>Photos</span></button>}
    </div>
    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md ${badgeColor}`}>{badge}</span>
      <span className="font-mono text-xs font-bold text-white drop-shadow-md">{price}</span>
    </div>
  </div>;
}
