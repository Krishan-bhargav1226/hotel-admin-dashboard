import type { FormEvent } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import UiDialog from "../../../components/ui/models/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { formatCurrency } from "../../../utils/helper/helper";
import type { MenuItem as MenuCatalogItem, PaymentMode, ServiceOrderItem, Stay } from "../../../utils/interfaces/Interface";

const CATEGORY_LABELS = {
  BREAKFAST: "Breakfast",
  MAIN_COURSE: "Main Course & Meals",
  SNACKS: "Snacks & Starters",
  BEVERAGES: "Beverages & Coffee",
  LAUNDRY: "Laundry & Ironing",
  EXTRA_SERVICE: "Amenities & Taxi",
} as const;

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  activeStays: Stay[];
  menuItems: MenuCatalogItem[];
  selectedRoomId: string;
  onRoomChange: (roomId: string) => void;
  orderCart: Record<string, number>;
  updateCartQty: (itemId: string, delta: number) => void;
  cartItemsList: ServiceOrderItem[];
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  billedToRoom: boolean;
  onBillingChange: (billedToRoom: boolean) => void;
  directPaymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  orderNotes: string;
  onNotesChange: (notes: string) => void;
  isOrdering: boolean;
}

export default function OrderDialog({
  open,
  onClose,
  onSubmit,
  activeStays,
  menuItems,
  selectedRoomId,
  onRoomChange,
  orderCart,
  updateCartQty,
  cartItemsList,
  cartSubtotal,
  cartTax,
  cartTotal,
  billedToRoom,
  onBillingChange,
  directPaymentMode,
  onPaymentModeChange,
  orderNotes,
  onNotesChange,
  isOrdering,
}: OrderDialogProps) {
  return (
    <UiDialog open={open} onClose={onClose} title="New Room Service & Amenity Order" maxWidth="md">
      <form onSubmit={onSubmit} className="space-y-4 pt-1">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Destination Guest Room (In-House Stays)
          </label>
          <FormControl fullWidth size="small" required>
            <InputLabel>Select Occupied Room</InputLabel>
            <Select value={selectedRoomId} label="Select Occupied Room" onChange={(event) => onRoomChange(event.target.value)}>
              {activeStays.length === 0 ? (
                <MenuItem value="" disabled>No active stays in hotel</MenuItem>
              ) : (
                activeStays.map((stay) => (
                  <MenuItem key={stay.roomId} value={stay.roomId}>
                    Room {stay.roomNumber} · {stay.guestName} ({stay.roomTypeName})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Menu & Amenities Catalog</label>
            <span className="text-[11px] text-slate-400 font-medium">{menuItems.length} items available</span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2">
            {menuItems.map((item) => {
              const quantity = orderCart[item.id] || 0;
              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200/90 bg-white p-2.5 shadow-2xs">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {CATEGORY_LABELS[item.category]} · {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateCartQty(item.id, -1)} disabled={quantity === 0} className="w-7 h-7 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.95] disabled:opacity-30 cursor-pointer flex items-center justify-center transition-all">-</button>
                    <span className="w-5 text-center font-mono font-bold text-xs text-slate-900">{quantity}</span>
                    <button type="button" onClick={() => updateCartQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-brand-700 text-white font-bold hover:bg-brand-800 active:scale-[0.95] cursor-pointer flex items-center justify-center transition-all">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-slate-500">Cart Items: <strong className="text-slate-800">{cartItemsList.length} items selected</strong></div>
            <div className="text-slate-500 text-[11px] mt-0.5">Subtotal: {formatCurrency(cartSubtotal)} + 5% GST: {formatCurrency(cartTax)}</div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">Total Bill: {formatCurrency(cartTotal)}</div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-slate-700">Billing Method:</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => onBillingChange(true)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${billedToRoom ? "bg-brand-700 text-white border-brand-700 shadow-2xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>Charge to Room Folio</button>
              <button type="button" onClick={() => onBillingChange(false)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${!billedToRoom ? "bg-brand-700 text-white border-brand-700 shadow-2xs" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>Direct Payment</button>
            </div>
            {!billedToRoom && (
              <div className="flex items-center gap-1 mt-1">
                {(["UPI", "CASH", "CARD"] as PaymentMode[]).map((mode) => (
                  <button key={mode} type="button" onClick={() => onPaymentModeChange(mode)} className={`flex-1 py-1 px-2 text-[10px] font-semibold rounded border transition-all cursor-pointer ${directPaymentMode === mode ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200"}`}>{mode}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <TextField label="Chef / Kitchen Delivery Instructions" fullWidth size="small" placeholder="e.g. Extra spicy, serve with hot water, deliver to room immediately" value={orderNotes} onChange={(event) => onNotesChange(event.target.value)} />
        <DialogActions className="!px-0 !pt-2">
          <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>Cancel</Button>
          <UISubmitButton type="submit" text={`Confirm & Dispatch Order (${formatCurrency(cartTotal)})`} loading={isOrdering} disabled={cartItemsList.length === 0} />
        </DialogActions>
      </form>
    </UiDialog>
  );
}
