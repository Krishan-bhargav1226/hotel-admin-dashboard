import { MdDeleteOutline, MdLogout, MdReceiptLong, MdRoomService } from "react-icons/md";

interface StayCardActionsProps { active: boolean; onView: () => void; onRoomService: () => void; onCheckout: () => void; onDelete: () => void; }

export default function StayCardActions({ active, onView, onRoomService, onCheckout, onDelete }: StayCardActionsProps) {
  return <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
    <button type="button" onClick={onView} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"><MdReceiptLong size={15} className="text-slate-500" aria-hidden="true" />Folio</button>
    {active && <button type="button" onClick={onRoomService} aria-label="Order room service" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"><MdRoomService size={16} aria-hidden="true" /></button>}
    {active ? <button type="button" onClick={onCheckout} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-rose-700"><MdLogout size={15} aria-hidden="true" />Check out</button> : <button type="button" onClick={onDelete} aria-label="Delete stay record" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"><MdDeleteOutline size={16} aria-hidden="true" /></button>}
  </div>;
}
