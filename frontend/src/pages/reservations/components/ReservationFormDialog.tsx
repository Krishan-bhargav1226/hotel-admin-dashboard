import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { MdCheckCircle, MdKingBed, MdPeople } from "react-icons/md";
import UiDialog from "../../../components/ui/models/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { formatCurrency } from "../../../utils/helper/helper";
import { getRoomMeta, getRoomPhoto } from "../../../utils/helper/roomImages";
import type { BookingSource, PaymentMode, Room, RoomType } from "../../../utils/interfaces/Interface";

export interface ReservationFormValues {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  roomTypeId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  advanceAmount: number;
  paymentMode: PaymentMode;
  source: BookingSource;
  specialRequests: string;
}

const GUEST_FILTERS = [
  { id: "ALL", label: "All Room Types" },
  { id: "COUPLE", label: "Couples & Romance" },
  { id: "SOLO", label: "Business & Solo" },
  { id: "FAMILY", label: "Family Suites" },
  { id: "ACCESSIBLE", label: "Accessible / Seniors" },
  { id: "PRESIDENTIAL", label: "VIP Penthouse" },
  { id: "BUDGET", label: "Budget Transit" },
];

interface ReservationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: ReservationFormValues;
  setForm: Dispatch<SetStateAction<ReservationFormValues>>;
  nights: number;
  roomTypes: RoomType[];
  rooms: Room[];
  guestFilter: string;
  setGuestFilter: (filter: string) => void;
  onDateChange: (field: "checkInDate" | "checkOutDate", value: string) => void;
  onSelectRoomType: (typeId: string) => void;
  isCreating: boolean;
}

export default function ReservationFormDialog({
  open, onClose, onSubmit, form, setForm, nights, roomTypes, rooms, guestFilter,
  setGuestFilter, onDateChange, onSelectRoomType, isCreating,
}: ReservationFormDialogProps) {
  return (
    <UiDialog open={open} onClose={onClose} title="New Room Reservation · Front Desk Concierge" maxWidth="md">
      <form onSubmit={onSubmit} className="space-y-5 pt-1">
        <div>
          <div className="flex items-center gap-1.5 mb-2.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" /><span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500">1. Guest Contact & Booking Channel</span></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <TextField label="Guest Full Name *" required fullWidth size="small" placeholder="Full Name" value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} />
            <TextField label="Mobile Number *" required fullWidth size="small" placeholder="10-digit Mobile" value={form.guestPhone} onChange={(event) => setForm({ ...form, guestPhone: event.target.value })} />
            <TextField label="Email Address" fullWidth size="small" type="email" placeholder="guest@example.com" value={form.guestEmail} onChange={(event) => setForm({ ...form, guestEmail: event.target.value })} />
            <FormControl fullWidth size="small">
              <InputLabel>Booking Channel</InputLabel>
              <Select value={form.source} label="Booking Channel" onChange={(event) => setForm({ ...form, source: event.target.value as BookingSource })}>
                <MenuItem value="BOOKING_COM">Booking.com</MenuItem><MenuItem value="MAKEMYTRIP">MakeMyTrip</MenuItem><MenuItem value="AGODA">Agoda</MenuItem><MenuItem value="WEBSITE">Hotel Website Direct</MenuItem><MenuItem value="DIRECT_WALKIN">Direct Walk-in</MenuItem><MenuItem value="PHONE">Phone Inquiry</MenuItem><MenuItem value="CORPORATE">Corporate Tie-up</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" /><span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500">2. Stay Dates & Length of Stay</span></div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700"><span>{nights} {nights === 1 ? "Night" : "Nights"} Stay</span></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField label="Check-In Date *" type="date" required fullWidth size="small" value={form.checkInDate} onChange={(event) => onDateChange("checkInDate", event.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Check-Out Date *" type="date" required fullWidth size="small" value={form.checkOutDate} onChange={(event) => onDateChange("checkOutDate", event.target.value)} InputLabelProps={{ shrink: true }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-600 inline-block" /><span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500">3. Select Room Category (Tailored for All Guest Types)</span></div><span className="text-xs text-slate-400 font-medium">Click to select</span></div>
          <div className="flex flex-wrap items-center gap-1 mb-3 bg-slate-100/70 p-1 rounded-xl">
            {GUEST_FILTERS.map((tab) => <button key={tab.id} type="button" onClick={() => setGuestFilter(tab.id)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${guestFilter === tab.id ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"}`}>{tab.label}</button>)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
            {roomTypes.filter((type) => guestFilter === "ALL" || getRoomMeta(null, type).category === guestFilter).map((type) => {
              const meta = getRoomMeta(null, type);
              const isSelected = form.roomTypeId === type.id;
              return (
                <div key={type.id} onClick={() => onSelectRoomType(type.id)} className={`group relative flex flex-col justify-between rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? "border-brand-700 bg-white ring-2 ring-slate-900 shadow-md" : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"}`}>
                  <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                    <img src={getRoomPhoto(null, type)} alt={type.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    <span className={`absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold shadow-xs backdrop-blur-md ${meta.badgeColor}`}>{meta.badge}</span>
                    {isSelected && <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-white shadow-md"><MdCheckCircle size={16} className="text-emerald-400" /></span>}
                    <span className="absolute bottom-1.5 right-2 font-mono text-xs font-bold text-white drop-shadow-md">{formatCurrency(meta.basePrice)} / night</span>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{type.name}</h4><p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{meta.guestTypeLabel}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600 font-medium"><span className="inline-flex items-center gap-1"><MdPeople size={11} className="text-slate-400" /><span>Max {meta.maxGuests}</span></span><span className="inline-flex items-center gap-1 truncate max-w-[110px]"><MdKingBed size={11} className="text-slate-400" /><span>{meta.bedConfig}</span></span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <FormControl fullWidth size="small">
              <InputLabel>Specific Room Assignment (Optional)</InputLabel>
              <Select value={form.roomId} label="Specific Room Assignment (Optional)" onChange={(event) => setForm({ ...form, roomId: event.target.value })}>
                <MenuItem value="">Auto-Assign at Check-in (Recommended)</MenuItem>
                {rooms.filter((room) => !form.roomTypeId || room.roomTypeId === form.roomTypeId).map((room) => <MenuItem key={room.id} value={room.id}>Room {room.number} ({room.floor})</MenuItem>)}
              </Select>
            </FormControl>
            <div className="mt-3"><TextField label="Special Requests / Front Desk Notes" fullWidth multiline rows={2} size="small" placeholder="e.g. Late airport arrival, extra pillows, high floor room" value={form.specialRequests} onChange={(event) => setForm({ ...form, specialRequests: event.target.value })} /></div>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2 mb-2"><span>Booking Tariff Breakdown</span><span className="font-mono text-brand-700">{nights} Nights × {formatCurrency((form.totalAmount || 0) / nights)}</span></div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <TextField label="Total Tariff (₹) *" type="number" required fullWidth size="small" value={form.totalAmount} onChange={(event) => setForm({ ...form, totalAmount: Number(event.target.value) })} />
                <TextField label="Advance Paid (₹)" type="number" fullWidth size="small" value={form.advanceAmount} onChange={(event) => setForm({ ...form, advanceAmount: Number(event.target.value) })} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-1 mb-2"><span className="text-[11px] text-slate-500 font-semibold">Payment Mode:</span><div className="flex items-center gap-1">{(["UPI", "CARD", "CASH"] as PaymentMode[]).map((mode) => <button key={mode} type="button" onClick={() => setForm({ ...form, paymentMode: mode })} className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${form.paymentMode === mode ? "bg-brand-700 text-white border-brand-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}>{mode}</button>)}</div></div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200"><span className="text-slate-500">Balance Due at Check-In</span><span className="font-mono font-bold text-slate-900">{formatCurrency(Math.max(0, form.totalAmount - form.advanceAmount))}</span></div>
            </div>
          </div>
        </div>
        <DialogActions className="!px-0 !pt-2"><Button onClick={onClose} color="inherit">Cancel</Button><UISubmitButton type="submit" text="Confirm Advance Booking" loading={isCreating} /></DialogActions>
      </form>
    </UiDialog>
  );
}
