import { MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";
import type { Room } from "../../../utils/interfaces/Interface";
import type { RoomPhotoMeta } from "../../../utils/helper/roomImages";

interface RoomGalleryHeroProps { room?: Partial<Room> | null; meta: RoomPhotoMeta; gallery: string[]; title: string; activeIndex: number; onSelect: (index: number) => void; onClose: () => void; }

export default function RoomGalleryHero({ room, meta, gallery, title, activeIndex, onSelect, onClose }: RoomGalleryHeroProps) {
  const previous = () => onSelect(activeIndex === 0 ? gallery.length - 1 : activeIndex - 1);
  const next = () => onSelect(activeIndex === gallery.length - 1 ? 0 : activeIndex + 1);
  return <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 sm:aspect-[16/9]">
    <img src={gallery[activeIndex]} alt={`${title} photo ${activeIndex + 1}`} className="h-full w-full object-cover transition-all duration-300" />
    <button type="button" onClick={onClose} className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80" aria-label="Close photo preview"><MdClose size={20} /></button>
    <div className="absolute left-3 top-3 z-10 flex items-center gap-2"><span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-md backdrop-blur-md ${meta.badgeColor}`}>{meta.badge}</span>{room && <span className="inline-flex items-center rounded-full bg-black/60 px-2.5 py-1 font-mono text-xs font-bold text-white backdrop-blur-md">{room.floor}</span>}</div>
    {gallery.length > 1 && <>
      <button type="button" onClick={previous} className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80" aria-label="Previous photo"><MdChevronLeft size={24} /></button>
      <button type="button" onClick={next} className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80" aria-label="Next photo"><MdChevronRight size={24} /></button>
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-black/40 p-1.5 backdrop-blur-md">{gallery.map((image, index) => <button key={image + index} type="button" onClick={() => onSelect(index)} className={`h-11 w-16 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${activeIndex === index ? "scale-105 border-white shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`} aria-label={`Show photo ${index + 1}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>
    </>}
  </div>;
}
