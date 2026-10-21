import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import UiDialog from "../../../components/ui/models/UiDialog";
import type { ShiftType, StaffMember, StaffRole } from "../../../utils/interfaces/Interface";

const ROLES: Record<StaffRole, string> = {
  SUPER_ADMIN: "Super Admin (Chain-wide)",
  ADMIN: "Property Admin",
  MANAGER: "General Manager",
  RECEPTIONIST: "Front Desk Receptionist",
  HOUSEKEEPING: "Housekeeping Executive",
  CHEF: "Head Chef / Kitchen",
  MAINTENANCE: "Maintenance & Engineering",
};

interface StaffDialogProps {
  open: boolean;
  onClose: () => void;
  form: Partial<StaffMember>;
  setForm: Dispatch<SetStateAction<Partial<StaffMember>>>;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
}

export default function StaffDialog({ open, onClose, form, setForm, onSubmit, loading }: StaffDialogProps) {
  return (
    <UiDialog open={open} onClose={onClose} title="Employee Profile" maxWidth="xs">
      <form onSubmit={onSubmit} className="space-y-4 pt-1">
        <TextField label="Employee Full Name *" required fullWidth size="small" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <FormControl fullWidth size="small">
          <InputLabel>Department / Role</InputLabel>
          <Select value={form.role || "RECEPTIONIST"} label="Department / Role" onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}>
            {Object.entries(ROLES).map(([role, label]) => <MenuItem key={role} value={role}>{label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Mobile Number *" required fullWidth size="small" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <FormControl fullWidth size="small">
          <InputLabel>Shift Assignment</InputLabel>
          <Select value={form.shift || "FULL_DAY"} label="Shift Assignment" onChange={(e) => setForm({ ...form, shift: e.target.value as ShiftType })}>
            <MenuItem value="MORNING">Morning (7 AM - 3 PM)</MenuItem>
            <MenuItem value="EVENING">Evening (3 PM - 11 PM)</MenuItem>
            <MenuItem value="NIGHT">Night (11 PM - 7 AM)</MenuItem>
            <MenuItem value="FULL_DAY">Full Day (General Shift)</MenuItem>
          </Select>
        </FormControl>
        <DialogActions className="!px-0 !pt-2">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <UISubmitButton type="submit" text="Save Employee" loading={loading} />
        </DialogActions>
      </form>
    </UiDialog>
  );
}
