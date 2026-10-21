import { ConciergeBell, LogIn, LogOut, Sparkles, Wrench } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { Room } from "../../../utils/interfaces/Interface";

interface RoomTileActionsProps {
  room: Room;
  onCheckIn: () => void;
  onOpenStay: () => void;
  onCheckOut: () => void;
  onOrderService?: () => void;
  onSetStatus: (status: "AVAILABLE" | "CLEANING" | "MAINTENANCE") => void;
}

export default function RoomTileActions({ room, onCheckIn, onOpenStay, onCheckOut, onOrderService, onSetStatus }: RoomTileActionsProps) {
  return <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border)] pt-3">
    {room.status === "AVAILABLE" && <>
      <button type="button" onClick={onCheckIn} className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-brand-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"><LogIn size={14} aria-hidden="true" /><span>Check In</span></button>
      <button type="button" onClick={() => onSetStatus("CLEANING")} aria-label="Send to cleaning" className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900"><Sparkles size={16} aria-hidden="true" /></button>
    </>}
    {room.status === "OCCUPIED" && <>
      <button type="button" onClick={onOpenStay} className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Folio</button>
      {onOrderService && <button type="button" onClick={onOrderService} aria-label="Room service" className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900"><ConciergeBell size={16} aria-hidden="true" /></button>}
      <button type="button" onClick={onCheckOut} className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-rose-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"><LogOut size={13} aria-hidden="true" /><span>Check Out</span></button>
    </>}
    {room.status === "CLEANING" && <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" icon={Sparkles} onClick={() => onSetStatus("AVAILABLE")}>Mark clean and ready</Button>}
    {room.status === "MAINTENANCE" && <Button size="sm" variant="outline" className="w-full" icon={Wrench} onClick={() => onSetStatus("AVAILABLE")}>Restore to service</Button>}
  </div>;
}
