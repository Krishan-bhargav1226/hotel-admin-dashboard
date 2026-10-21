import { useState } from "react";
import toast from "react-hot-toast";
import { Shield, UserPlus, Trash2, CheckCircle, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { HotelProperty, StaffMember, StaffRole } from "../../../utils/interfaces/Interface";
import { useSaveStaffMemberMutation, useDeleteStaffMemberMutation } from "../../../store/services/staff/staffSlice";
import { getErrorMessage } from "../../../utils/helper/helper";

interface RoleGovernanceSectionProps {
  staffList: StaffMember[];
  properties: HotelProperty[];
  onOpenAddStaff: () => void;
}

const ROLES_LIST: { id: StaffRole; label: string }[] = [
  { id: "SUPER_ADMIN", label: "Super Admin (HQ)" },
  { id: "ADMIN", label: "Property Admin" },
  { id: "MANAGER", label: "General Manager" },
  { id: "RECEPTIONIST", label: "Front Desk" },
  { id: "CHEF", label: "Executive Chef" },
  { id: "HOUSEKEEPING", label: "Housekeeping" },
  { id: "MAINTENANCE", label: "Maintenance" },
];

export default function RoleGovernanceSection({
  staffList,
  properties,
  onOpenAddStaff,
}: RoleGovernanceSectionProps) {
  const [filterProp, setFilterProp] = useState<string>("ALL");
  const [saveStaff] = useSaveStaffMemberMutation();
  const [deleteStaff] = useDeleteStaffMemberMutation();

  const filteredStaff = staffList.filter((s) => {
    if (filterProp === "ALL") return true;
    return s.propertyId === filterProp || s.propertyId === "ALL";
  });

  const handleRoleChange = async (member: StaffMember, newRole: StaffRole) => {
    try {
      await saveStaff({
        id: member.id,
        name: member.name,
        role: newRole,
        phone: member.phone,
        shift: member.shift,
        status: member.status,
        propertyId: member.propertyId,
        propertyName: member.propertyName,
      }).unwrap();
      toast.success(`Role updated to ${newRole} for ${member.name}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleDuty = async (member: StaffMember) => {
    try {
      const nextStatus = member.status === "ON_DUTY" ? "OFF_DUTY" : "ON_DUTY";
      await saveStaff({
        ...member,
        status: nextStatus,
      }).unwrap();
      toast.success(`${member.name} is now ${nextStatus === "ON_DUTY" ? "On Duty" : "Off Duty"}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (member: StaffMember) => {
    if (!window.confirm(`Revoke credentials and remove ${member.name}?`)) return;
    try {
      await deleteStaff(member.id).unwrap();
      toast.success(`Staff member ${member.name} removed`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chain-wide Staff & Role Governance Center
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Control user permissions, role hierarchies, and property assignments across all hotels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterProp}
            onChange={(e) => setFilterProp(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Properties ({staffList.length} staff)</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <Button size="sm" variant="primary" icon={UserPlus} onClick={onOpenAddStaff} className="h-7.5 text-xs">
            Onboard Staff
          </Button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="pb-2">Staff Member</th>
              <th className="pb-2">Property Assignment</th>
              <th className="pb-2">Role Authority</th>
              <th className="pb-2 text-center">Duty Status</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStaff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2.5">
                  <div className="font-semibold text-slate-900 dark:text-white">{member.name}</div>
                  <div className="font-mono text-[11px] text-slate-400">{member.phone}</div>
                </td>
                <td className="py-2.5">
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {member.propertyName || "Chain-wide (All Properties)"}
                  </span>
                </td>
                <td className="py-2.5">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member, e.target.value as StaffRole)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-brand-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-brand-300"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5 text-center">
                  <button
                    onClick={() => handleToggleDuty(member)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                      member.status === "ON_DUTY"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {member.status === "ON_DUTY" ? (
                      <>
                        <CheckCircle className="size-3 text-emerald-600" /> On Duty
                      </>
                    ) : (
                      <>
                        <Clock className="size-3 text-slate-400" /> Off Duty
                      </>
                    )}
                  </button>
                </td>
                <td className="py-2.5 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    className="h-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                    onClick={() => handleDelete(member)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
