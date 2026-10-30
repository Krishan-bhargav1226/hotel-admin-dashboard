import { useState } from "react";
import toast from "react-hot-toast";
import { Shield, UserPlus, Trash2, CheckCircle, Clock, Users, ShieldCheck, Mail, Phone } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { HotelProperty, StaffMember, StaffRole } from "../../../utils/interfaces/Interface";
import { useSaveStaffMemberMutation, useDeleteStaffMemberMutation } from "../../../store/services/staff/staffSlice";
import {
  useGetRegisteredUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  type RegisteredUser,
} from "../../../store/services/user/userSlice";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "../../../store/services/notification/notificationSlice";
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

const SYSTEM_ROLES = [
  { id: "User", label: "Normal User (Default)" },
  { id: "Reception", label: "Front Desk (Reception)" },
  { id: "Admin", label: "Hotel Admin (Property)" },
  { id: "SuperAdmin", label: "Super Admin (Chain HQ)" },
];

export default function RoleGovernanceSection({
  staffList,
  properties,
  onOpenAddStaff,
}: RoleGovernanceSectionProps) {
  const [activeTab, setActiveTab] = useState<"users" | "staff">("users");
  const [filterProp, setFilterProp] = useState<string>("ALL");
  const [userSearch, setUserSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "PENDING" | "RECEPTION" | "ADMIN" | "SUPERADMIN">("ALL");

  const [saveStaff] = useSaveStaffMemberMutation();
  const [deleteStaff] = useDeleteStaffMemberMutation();

  const { data: registeredUsers = [], isLoading: isLoadingUsers } = useGetRegisteredUsersQuery();
  const { data: notifications = [] } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [hotelChoice, setHotelChoice] = useState<Record<string, string>>({});

  const pendingCount = registeredUsers.filter(
    (u) => !u.roles[0] || u.roles[0].name.toLowerCase() === "user"
  ).length;

  const filteredUsers = registeredUsers.filter((u) => {
    const primaryRole = (u.roles[0]?.name || "User").toLowerCase();
    if (roleFilter === "PENDING" && primaryRole !== "user") return false;
    if (roleFilter === "RECEPTION" && primaryRole !== "reception") return false;
    if (roleFilter === "ADMIN" && primaryRole !== "admin") return false;
    if (roleFilter === "SUPERADMIN" && primaryRole !== "superadmin") return false;

    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(q)
    );
  });

  const filteredStaff = staffList.filter((s) => {
    if (filterProp === "ALL") return true;
    return s.propertyId === filterProp || s.propertyId === "ALL";
  });

  const handleUserRoleChange = async (targetUser: RegisteredUser, newRoleName: string, propertyValue?: string) => {
    const selectedHotel = propertyValue ?? hotelChoice[targetUser.id] ?? (targetUser.propertyId ? String(targetUser.propertyId) : "");
    if ((newRoleName === "Admin" || newRoleName === "Reception") && !selectedHotel) {
      toast.error("Choose a hotel before assigning this role.");
      return;
    }
    if (!targetUser.emailConfirmed) {
      toast.error("This user has not verified their email yet.");
      return;
    }
    try {
      await updateUserRole({
        userId: targetUser.id,
        roles: [newRoleName],
        propertyId: newRoleName === "SuperAdmin" ? null : selectedHotel ? Number(selectedHotel) : null,
      }).unwrap();
      toast.success(`Saved ${newRoleName} for ${targetUser.firstName} ${targetUser.lastName}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteUser = async (targetUser: RegisteredUser) => {
    if (!window.confirm(`Permanently remove user ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})?`)) return;
    try {
      await deleteUser(targetUser.id).unwrap();
      toast.success(`User ${targetUser.email} removed`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRoleChange = async (member: StaffMember, newRole: StaffRole) => {
    try {
      await saveStaff({
        ...member,
        role: newRole,
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

  const handleDeleteStaff = async (member: StaffMember) => {
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
              Chain-wide User & Role Governance Center
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage normal registered users, grant desk authority (Front Desk, Hotel Admin), and maintain staff roles.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTab === "users"
                ? "bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Users className="size-3.5" />
            Registered Users ({registeredUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTab === "staff"
                ? "bg-white text-brand-700 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            Operational Staff ({staffList.length})
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <div className="mt-3 space-y-3">
          {notifications.filter((item) => !item.isRead).length > 0 ? (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">New user notifications</p>
              {notifications.filter((item) => !item.isRead).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-[11px] text-amber-950 dark:text-amber-100">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-0.5">{item.message}</p>
                  </div>
                  <button type="button" className="shrink-0 font-semibold text-amber-800 underline" onClick={() => markRead(item.id)}>
                    Mark read
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search registered user by name or email…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-8 w-64 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 placeholder-slate-400 shadow-xs outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => setUserSearch("")}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}

              {/* Role filter chips */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setRoleFilter("ALL")}
                  className={`rounded-md px-2 py-0.5 font-medium transition ${
                    roleFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  All ({registeredUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("PENDING")}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-medium transition ${
                    roleFilter === "PENDING"
                      ? "bg-amber-100 text-amber-900 shadow-xs dark:bg-amber-900/60 dark:text-amber-200 font-bold"
                      : "text-amber-700 hover:bg-amber-50 dark:text-amber-400"
                  }`}
                >
                  Pending Role ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("RECEPTION")}
                  className={`rounded-md px-2 py-0.5 font-medium transition ${
                    roleFilter === "RECEPTION"
                      ? "bg-sky-100 text-sky-900 shadow-xs dark:bg-sky-900/60 dark:text-sky-200 font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Front Desk
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("ADMIN")}
                  className={`rounded-md px-2 py-0.5 font-medium transition ${
                    roleFilter === "ADMIN"
                      ? "bg-emerald-100 text-emerald-900 shadow-xs dark:bg-emerald-900/60 dark:text-emerald-200 font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Hotel Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter("SUPERADMIN")}
                  className={`rounded-md px-2 py-0.5 font-medium transition ${
                    roleFilter === "SUPERADMIN"
                      ? "bg-purple-100 text-purple-900 shadow-xs dark:bg-purple-900/60 dark:text-purple-200 font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  Super Admin
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Select any role to grant immediate desk authority to registered accounts.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-2">User / Contact</th>
                  <th className="pb-2">Account Type</th>
                  <th className="pb-2">Assigned Role Authority</th>
                  <th className="pb-2 text-center">Registration Date</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Loading registered users…
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const primaryRole = u.roles[0]?.name || "User";
                    const isNormalUser = primaryRole.toLowerCase() === "user" || !primaryRole;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Mail className="size-3" /> {u.email}
                            </span>
                            {u.phoneNumber && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="size-3" /> {u.phoneNumber}
                              </span>
                            )}
                            <span className={u.emailConfirmed ? "text-emerald-600" : "text-amber-600"}>
                              {u.emailConfirmed ? "Email verified" : "Email not verified"}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5">
                          {isNormalUser ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                              Normal User (Pending Role)
                            </span>
                          ) : primaryRole.toLowerCase() === "superadmin" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-800 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300">
                              Super Admin (HQ)
                            </span>
                          ) : primaryRole.toLowerCase() === "admin" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                              Hotel Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
                              Front Desk (Reception)
                            </span>
                          )}
                        </td>

                        <td className="py-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={hotelChoice[u.id] ?? (u.propertyId ? String(u.propertyId) : "")}
                              onChange={(e) => {
                                const value = e.target.value;
                                setHotelChoice((current) => ({ ...current, [u.id]: value }));
                                if (primaryRole !== "User") handleUserRoleChange(u, primaryRole, value);
                              }}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                            >
                              <option value="">Select hotel</option>
                              {properties.map((property) => (
                                <option key={property.id} value={property.id}>{property.name}</option>
                              ))}
                            </select>
                            <select
                              disabled={isUpdatingRole || !u.emailConfirmed}
                              value={primaryRole}
                              onChange={(e) => handleUserRoleChange(u, e.target.value)}
                              className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-xs outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-300"
                            >
                              {SYSTEM_ROLES.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="py-2.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
                          {u.createdDate ? u.createdDate.slice(0, 10) : "Active"}
                        </td>

                        <td className="py-2.5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Trash2}
                            className="h-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                            onClick={() => handleDeleteUser(u)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* OPERATIONAL STAFF TAB */
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
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

          <div className="overflow-x-auto">
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
                        onClick={() => handleDeleteStaff(member)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
