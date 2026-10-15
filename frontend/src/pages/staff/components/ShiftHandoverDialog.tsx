import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import UiDialog from "../../../components/ui/models/UiDialog";
import { formatCurrency } from "../../../utils/helper/helper";
import type { ShiftType } from "../../../utils/interfaces/Interface";

export interface ShiftFormValues {
  shiftDate: string;
  shiftType: ShiftType;
  staffName: string;
  openingCash: number;
  cashCollected: number;
  pettyExpensesPaid: number;
  actualCashCounted: number;
  handoverNotes: string;
}

interface ShiftHandoverDialogProps {
  open: boolean;
  onClose: () => void;
  form: ShiftFormValues;
  setForm: Dispatch<SetStateAction<ShiftFormValues>>;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  expectedClosing: number;
  cashVariance: number;
}

export default function ShiftHandoverDialog({ open, onClose, form, setForm, onSubmit, loading, expectedClosing, cashVariance }: ShiftHandoverDialogProps) {
  const update = <K extends keyof ShiftFormValues>(key: K, value: ShiftFormValues[K]) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <UiDialog open={open} onClose={onClose} title="Record Shift Cash Handover" maxWidth="sm">
      <form onSubmit={onSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Shift Date" type="date" fullWidth size="small" value={form.shiftDate} onChange={(e) => update("shiftDate", e.target.value)} InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth size="small">
            <InputLabel>Shift Type</InputLabel>
            <Select value={form.shiftType} label="Shift Type" onChange={(e) => update("shiftType", e.target.value as ShiftType)}>
              <MenuItem value="MORNING">Morning Shift</MenuItem><MenuItem value="EVENING">Evening Shift</MenuItem><MenuItem value="NIGHT">Night Shift</MenuItem>
            </Select>
          </FormControl>
        </div>
        <TextField label="Outgoing Receptionist Name *" required fullWidth size="small" value={form.staffName} onChange={(e) => update("staffName", e.target.value)} />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Opening Float (₹)" type="number" fullWidth size="small" value={form.openingCash} onChange={(e) => update("openingCash", Number(e.target.value))} />
          <TextField label="Cash Collected (₹)" type="number" fullWidth size="small" value={form.cashCollected} onChange={(e) => update("cashCollected", Number(e.target.value))} />
          <TextField label="Petty Expenses (₹)" type="number" fullWidth size="small" value={form.pettyExpensesPaid} onChange={(e) => update("pettyExpensesPaid", Number(e.target.value))} />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3 text-xs">
          <div><div className="font-medium text-gray-500">Calculated System Expected Cash:</div><div className="text-base font-black text-slate-900">{formatCurrency(expectedClosing)}</div></div>
          <div><div className="font-medium text-gray-500">Drawer Variance:</div><div className={`text-sm font-black ${cashVariance === 0 ? "text-emerald-600" : "text-amber-600"}`}>{cashVariance === 0 ? "Perfect Match (₹0)" : `${cashVariance > 0 ? "+" : ""}${formatCurrency(cashVariance)}`}</div></div>
        </div>
        <TextField label="Actual Cash Counted in Physical Drawer (₹) *" type="number" required fullWidth size="small" value={form.actualCashCounted} onChange={(e) => update("actualCashCounted", Number(e.target.value))} />
        <TextField label="Shift Handover Notes & Pending Tasks" multiline rows={2} fullWidth size="small" placeholder="Room keys, night arrivals, open maintenance or special guest instructions" value={form.handoverNotes} onChange={(e) => update("handoverNotes", e.target.value)} />
        <DialogActions className="!px-0 !pt-2">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <UISubmitButton type="submit" color="secondary" text="Save Shift Handover" loading={loading} />
        </DialogActions>
      </form>
    </UiDialog>
  );
}
