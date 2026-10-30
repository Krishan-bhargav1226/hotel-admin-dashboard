import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Button, DialogActions, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import UiDialog from "../../../components/ui/modals/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import type { MaintenancePriority, Room, StaffMember } from "../../../utils/interfaces/Interface";

export interface MaintenanceFormValues {
  roomId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  reportedBy: string;
  assignedTo: string;
  cost: number;
}

interface MaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: MaintenanceFormValues;
  setForm: Dispatch<SetStateAction<MaintenanceFormValues>>;
  rooms: Room[];
  staff: StaffMember[];
  isCreating: boolean;
}

export default function MaintenanceDialog({ open, onClose, onSubmit, form, setForm, rooms, staff, isCreating }: MaintenanceDialogProps) {
  return (
    <UiDialog open={open} onClose={onClose} title="Log Room Maintenance Issue" maxWidth="sm">
      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        <FormControl fullWidth size="small" required>
          <InputLabel>Select Room</InputLabel>
          <Select value={form.roomId} label="Select Room" onChange={(event) => setForm({ ...form, roomId: event.target.value })}>
            {rooms.map((room) => <MenuItem key={room.id} value={room.id}>Room {room.number} ({room.floor})</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Issue Title *" required fullWidth size="small" placeholder="e.g. Split AC not cooling / TV remote unresponsive" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <TextField label="Detailed Description" multiline rows={2} fullWidth size="small" placeholder="Explain the problem observed" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select value={form.priority} label="Priority" onChange={(event) => setForm({ ...form, priority: event.target.value as MaintenancePriority })}>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High (Puts Room Under Maintenance)</MenuItem>
              <MenuItem value="EMERGENCY">Emergency</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Assign Technician</InputLabel>
            <Select value={form.assignedTo} label="Assign Technician" onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}>
              {staff.map((member) => <MenuItem key={member.id} value={member.name}>{member.name} ({member.role})</MenuItem>)}
              <MenuItem value="External Vendor">External Authorized Vendor</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Reported By" fullWidth size="small" value={form.reportedBy} onChange={(event) => setForm({ ...form, reportedBy: event.target.value })} />
          <TextField label="Estimated Cost (₹)" type="number" fullWidth size="small" value={form.cost} onChange={(event) => setForm({ ...form, cost: Number(event.target.value) })} />
        </div>
        <DialogActions className="!px-0 !pt-3">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <UISubmitButton type="submit" color="danger" text="Create Ticket" loading={isCreating} />
        </DialogActions>
      </form>
    </UiDialog>
  );
}
