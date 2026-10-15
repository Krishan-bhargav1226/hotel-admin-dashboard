import { Button, Chip } from "@mui/material";
import { MdAccessTime, MdDelete, MdPhone } from "react-icons/md";
import SectionBox from "../../../components/ui/container/SectionBox";
import type { StaffMember, StaffRole } from "../../../utils/interfaces/Interface";

const ROLE_LABELS: Record<StaffRole, { label: string; color: "primary" | "secondary" | "info" | "warning" | "default" }> = {
  MANAGER: { label: "General Manager", color: "secondary" },
  RECEPTIONIST: { label: "Front Desk Receptionist", color: "primary" },
  HOUSEKEEPING: { label: "Housekeeping Executive", color: "info" },
  CHEF: { label: "Head Chef / Kitchen", color: "warning" },
  MAINTENANCE: { label: "Maintenance & Engineering", color: "default" },
};

interface StaffDirectoryProps {
  staff: StaffMember[];
  onToggleDuty: (member: StaffMember) => void;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
}

export default function StaffDirectory({ staff, onToggleDuty, onEdit, onDelete }: StaffDirectoryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {staff.map((member) => {
        const role = ROLE_LABELS[member.role] || { label: member.role, color: "default" as const };
        const isOnDuty = member.status === "ON_DUTY";

        return (
          <SectionBox key={member.id} className="flex flex-col justify-between rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{member.name}</h4>
                  <Chip size="small" label={role.label} color={role.color} sx={{ mt: 0.5, fontSize: "0.7rem", fontWeight: 700 }} />
                </div>
                <Chip size="small" label={isOnDuty ? "On Duty" : "Off Duty"} color={isOnDuty ? "success" : "default"} variant={isOnDuty ? "filled" : "outlined"} sx={{ fontSize: "0.7rem", fontWeight: 800 }} />
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2"><MdPhone className="text-gray-400" /><span className="font-mono">{member.phone}</span></div>
                <div className="flex items-center gap-2"><MdAccessTime className="text-gray-400" /><span>Shift: <strong>{member.shift}</strong></span></div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <Button size="small" variant={isOnDuty ? "outlined" : "contained"} color={isOnDuty ? "warning" : "success"} onClick={() => onToggleDuty(member)} sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "none" }}>
                {isOnDuty ? "Mark Off Duty" : "Mark On Duty"}
              </Button>
              <div className="flex gap-1">
                <Button size="small" variant="text" onClick={() => onEdit(member)} sx={{ fontSize: "0.75rem" }}>Edit</Button>
                <Button size="small" color="error" onClick={() => onDelete(member)} sx={{ minWidth: "auto", p: 0.5 }} aria-label={`Remove ${member.name}`}><MdDelete size={16} /></Button>
              </div>
            </div>
          </SectionBox>
        );
      })}
    </div>
  );
}
