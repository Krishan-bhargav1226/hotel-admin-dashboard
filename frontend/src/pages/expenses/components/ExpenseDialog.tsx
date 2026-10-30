import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import UiDialog from "../../../components/ui/modals/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import type { ExpenseCategory, PaymentMode } from "../../../utils/interfaces/Interface";

export interface ExpenseFormValues {
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: PaymentMode;
  date: string;
  paidTo: string;
  notes: string;
}

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: ExpenseFormValues;
  setForm: Dispatch<SetStateAction<ExpenseFormValues>>;
  categories: Record<ExpenseCategory, { label: string }>;
  isCreating: boolean;
}

export default function ExpenseDialog({ open, onClose, onSubmit, form, setForm, categories, isCreating }: ExpenseDialogProps) {
  return (
    <UiDialog open={open} onClose={onClose} title="Record Operational Expense / Petty Cash" maxWidth="xs">
      <form onSubmit={onSubmit} className="space-y-4 pt-1">
        <TextField label="Expense Title / Description *" required fullWidth size="small" placeholder="e.g. Generator Diesel refill / Fresh vegetables" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <FormControl fullWidth size="small">
          <InputLabel>Expense Category</InputLabel>
          <Select value={form.category} label="Expense Category" onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })}>
            {Object.entries(categories).map(([key, value]) => <MenuItem key={key} value={key}>{value.label}</MenuItem>)}
          </Select>
        </FormControl>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Amount (₹) *" type="number" required fullWidth size="small" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} />
          <FormControl fullWidth size="small">
            <InputLabel>Payment Channel</InputLabel>
            <Select value={form.paymentMode} label="Payment Channel" onChange={(event) => setForm({ ...form, paymentMode: event.target.value as PaymentMode })}>
              <MenuItem value="CASH">Cash (Petty Safe)</MenuItem>
              <MenuItem value="UPI">UPI (QR / Bank)</MenuItem>
              <MenuItem value="CARD">Card / NetBanking</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Date" type="date" fullWidth size="small" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField label="Paid To / Vendor" fullWidth size="small" placeholder="Vendor Name" value={form.paidTo} onChange={(event) => setForm({ ...form, paidTo: event.target.value })} />
        </div>
        <TextField label="Notes / Bill Voucher No" fullWidth multiline rows={2} size="small" placeholder="Invoice number or item details" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        <DialogActions className="!px-0 !pt-2">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <UISubmitButton type="submit" color="danger" text="Save Expense Voucher" loading={isCreating} />
        </DialogActions>
      </form>
    </UiDialog>
  );
}
