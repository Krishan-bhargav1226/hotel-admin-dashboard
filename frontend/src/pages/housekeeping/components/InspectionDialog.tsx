import type { Dispatch, SetStateAction } from "react";
import { Button, DialogActions, TextField } from "@mui/material";
import { BedDouble, Bath, Sparkles, Tv, Coffee, KeyRound, CheckCircle2 } from "lucide-react";
import UiDialog from "../../../components/ui/modals/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import type { HousekeepingTask } from "../../../utils/interfaces/Interface";

export interface InspectionChecklist {
  linen: boolean;
  bathroom: boolean;
  toiletries: boolean;
  electronics: boolean;
  refreshments: boolean;
  locks: boolean;
}

const checklistItems = [
  { key: "linen", icon: <BedDouble className="text-brand-600" size={15} />, title: "1. Fresh Bedding & Pillowcases", description: "Clean crisp sheets, pillow covers & duvet fitted smoothly without creases." },
  { key: "bathroom", icon: <Bath className="text-sky-600" size={15} />, title: "2. Bathroom Sanitization & Towels", description: "Toilet, glass shower & vanity disinfected; fresh bath & hand towels hung." },
  { key: "toiletries", icon: <Sparkles className="text-amber-600" size={15} />, title: "3. Toiletries & Guest Amenities", description: "Soap, shampoo, dental kit & fresh tissue rolls replenished for incoming guests." },
  { key: "electronics", icon: <Tv className="text-rose-600" size={15} />, title: "4. Electronic & AC Remote Disinfection", description: "AC temperature verified; TV remote & phone wiped with alcohol sanitizer." },
  { key: "refreshments", icon: <Coffee className="text-emerald-600" size={15} />, title: "5. Mineral Water & Tea Station", description: "2x complimentary packaged mineral water & fresh tea/coffee sachets replenished." },
  { key: "locks", icon: <KeyRound className="text-purple-600" size={15} />, title: "6. Keycard Lock & Electronic Safe Zeroed", description: "Door reader responsive, safe unlocked and open for new guest configuration." },
] as const;

interface InspectionDialogProps {
  task: HousekeepingTask | null;
  checklist: InspectionChecklist;
  setChecklist: Dispatch<SetStateAction<InspectionChecklist>>;
  inspectorNotes: string;
  setInspectorNotes: (notes: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function InspectionDialog({ task, checklist, setChecklist, inspectorNotes, setInspectorNotes, onClose, onConfirm }: InspectionDialogProps) {
  return (
    <UiDialog open={Boolean(task)} onClose={onClose} title={`6-Point Sanitization & Turnover Inspection · Room ${task?.roomNumber}`} maxWidth="sm">
      <div className="space-y-4 pt-1">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-extrabold text-sm text-slate-900 block">Room {task?.roomNumber} · {task?.roomTypeName}</span>
            <span className="text-xs text-slate-500">Cleaner: <strong>{task?.assignedTo || "Housekeeping Staff"}</strong></span>
          </div>
          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">Inspection Required</span>
        </div>

        <div className="space-y-2.5">
          {checklistItems.map(({ key, icon, title, description }) => (
            <label key={key} className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="checkbox" checked={checklist[key]} onChange={(event) => setChecklist({ ...checklist, [key]: event.target.checked })} className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500" />
              <div className="text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">{icon} {title}</span>
                <span className="text-slate-500 block mt-0.5">{description}</span>
              </div>
            </label>
          ))}
        </div>

        <TextField label="Supervisor Notes / Observations (Optional)" fullWidth size="small" multiline rows={2} placeholder="e.g. Room spotless, fragrance spray applied" value={inspectorNotes} onChange={(event) => setInspectorNotes(event.target.value)} />
        <DialogActions className="!px-0 !pt-2">
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <UISubmitButton type="button" color="success" text="Certify Clean & Make Available" startIcon={<CheckCircle2 size={18} />} onClick={onConfirm} />
        </DialogActions>
      </div>
    </UiDialog>
  );
}
