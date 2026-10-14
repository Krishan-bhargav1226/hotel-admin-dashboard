import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  MdPeople,
  MdPointOfSale,
  MdAdd,
  MdPhone,
  MdDelete,
  MdAccessTime,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import SectionBox from "../../components/ui/container/SectionBox";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import UiDialog from "../../components/ui/models/UiDialog";
import {
  useCreateShiftRegisterMutation,
  useDeleteStaffMemberMutation,
  useGetShiftRegistersQuery,
  useGetStaffListQuery,
  useSaveStaffMemberMutation,
} from "../../store/services/staff/staffSlice";
import { formatCurrency, getErrorMessage } from "../../utils/helper/helper";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import type {
  ShiftType,
  StaffMember,
  StaffRole,
} from "../../utils/interfaces/Interface";

const ROLE_LABELS: Record<StaffRole, { label: string; color: "primary" | "secondary" | "info" | "warning" | "default" }> = {
  MANAGER: { label: "General Manager", color: "secondary" },
  RECEPTIONIST: { label: "Front Desk Receptionist", color: "primary" },
  HOUSEKEEPING: { label: "Housekeeping Executive", color: "info" },
  CHEF: { label: "Head Chef / Kitchen", color: "warning" },
  MAINTENANCE: { label: "Maintenance & Engineering", color: "default" },
};

export default function StaffShifts() {
  const { data: staffList = [] } = useGetStaffListQuery();
  const { data: shifts = [] } = useGetShiftRegistersQuery();

  const [saveStaff, { isLoading: isSavingStaff }] = useSaveStaffMemberMutation();
  const [deleteStaff] = useDeleteStaffMemberMutation();
  const [createShift, { isLoading: isSavingShift }] = useCreateShiftRegisterMutation();

  const [activeTab, setActiveTab] = useState(0);
  const [openStaffModal, setOpenStaffModal] = useState(false);
  const [openShiftModal, setOpenShiftModal] = useState(false);

  // Staff Form state
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>({
    name: "",
    role: "RECEPTIONIST",
    phone: "",
    shift: "MORNING",
    status: "ON_DUTY",
  });

  // Shift Register Form state
  const [shiftForm, setShiftForm] = useState({
    shiftDate: dayjs().format("YYYY-MM-DD"),
    shiftType: "MORNING" as ShiftType,
    staffName: "Aarav Sharma",
    openingCash: 5000,
    cashCollected: 12000,
    pettyExpensesPaid: 1200,
    actualCashCounted: 15800,
    handoverNotes: "All room keys accounted for. Night shift guest arriving around 11 PM.",
  });

  const expectedClosing = shiftForm.openingCash + shiftForm.cashCollected - shiftForm.pettyExpensesPaid;
  const cashVariance = shiftForm.actualCashCounted - expectedClosing;

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone) {
      toast.error("Please enter staff name and phone number");
      return;
    }
    try {
      await saveStaff({
        ...staffForm,
        name: staffForm.name,
        role: staffForm.role as StaffRole,
        phone: staffForm.phone,
      }).unwrap();
      toast.success("Staff profile saved");
      setOpenStaffModal(false);
      setStaffForm({
        name: "",
        role: "RECEPTIONIST",
        phone: "",
        shift: "MORNING",
        status: "ON_DUTY",
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShift({
        ...shiftForm,
        openingCash: Number(shiftForm.openingCash),
        cashCollected: Number(shiftForm.cashCollected),
        pettyExpensesPaid: Number(shiftForm.pettyExpensesPaid),
        actualCashCounted: Number(shiftForm.actualCashCounted),
      }).unwrap();
      toast.success("Shift register handover recorded successfully!");
      setOpenShiftModal(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <MainContainer>
      <Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <PageTitle title={APP_TEXT.titles.STAFF_SHIFTS} />
          <Typography variant="body2" className="text-gray-500">
            Hotel employee management, on-duty tracking, and cash drawer shift handover audit
          </Typography>
        </div>
        <Box className="flex items-center gap-2">
          <Tabs
            value={activeTab}
            onChange={(_e, v) => setActiveTab(v)}
            sx={{
              bgcolor: "background.paper",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              minHeight: 40,
              "& .MuiTab-root": { minHeight: 40, py: 1, px: 2, fontWeight: 600, fontSize: "0.85rem" },
            }}
          >
            <Tab icon={<MdPeople size={18} />} iconPosition="start" label="Staff Directory" />
            <Tab icon={<MdPointOfSale size={18} />} iconPosition="start" label="Shift Drawer Handover" />
          </Tabs>
          {activeTab === 0 ? (
            <UISubmitButton
              type="button"
              color="primary"
              text="Add Staff Member"
              startIcon={<MdAdd size={18} />}
              onClick={() => {
                setStaffForm({
                  name: "",
                  role: "RECEPTIONIST",
                  phone: "",
                  shift: "MORNING",
                  status: "ON_DUTY",
                });
                setOpenStaffModal(true);
              }}
            />
          ) : (
            <UISubmitButton
              type="button"
              color="secondary"
              text="New Shift Handover"
              startIcon={<MdPointOfSale size={18} />}
              onClick={() => setOpenShiftModal(true)}
            />
          )}
        </Box>
      </Box>

      {/* TAB 0: STAFF DIRECTORY */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {staffList.map((member) => {
            const roleConf = ROLE_LABELS[member.role] || { label: member.role, color: "default" };
            const isOnDuty = member.status === "ON_DUTY";
            return (
              <SectionBox
                key={member.id}
                className="bg-white shadow-sm rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{member.name}</h4>
                      <Chip
                        size="small"
                        label={roleConf.label}
                        color={roleConf.color}
                        sx={{ fontWeight: 700, fontSize: "0.7rem", mt: 0.5 }}
                      />
                    </div>
                    <Chip
                      size="small"
                      label={isOnDuty ? "On Duty" : "Off Duty"}
                      color={isOnDuty ? "success" : "default"}
                      variant={isOnDuty ? "filled" : "outlined"}
                      sx={{ fontWeight: 800, fontSize: "0.7rem" }}
                    />
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <MdPhone className="text-gray-400" />
                      <span className="font-mono">{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="text-gray-400" />
                      <span>Shift: <strong>{member.shift}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <Button
                    size="small"
                    variant={isOnDuty ? "outlined" : "contained"}
                    color={isOnDuty ? "warning" : "success"}
                    onClick={async () => {
                      await saveStaff({
                        ...member,
                        status: isOnDuty ? "OFF_DUTY" : "ON_DUTY",
                      });
                      toast.success(`${member.name} is now ${isOnDuty ? "Off Duty" : "On Duty"}`);
                    }}
                    sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
                  >
                    {isOnDuty ? "Mark Off Duty" : "Mark On Duty"}
                  </Button>

                  <div className="flex gap-1">
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setStaffForm(member);
                        setOpenStaffModal(true);
                      }}
                      sx={{ fontSize: "0.75rem" }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={async () => {
                        if (confirm(`Remove ${member.name} from staff directory?`)) {
                          await deleteStaff(member.id);
                          toast.success("Staff member deleted");
                        }
                      }}
                      sx={{ minWidth: "auto", p: 0.5 }}
                    >
                      <MdDelete size={16} />
                    </Button>
                  </div>
                </div>
              </SectionBox>
            );
          })}
        </div>
      )}

      {/* TAB 1: SHIFT HANDOVER & CASH REGISTER */}
      {activeTab === 1 && (
        <SectionBox className="bg-white shadow-sm rounded-xl">
          <Typography variant="h6" fontWeight={700} className="mb-3 text-slate-900">
            Front Desk Cash Register Handover Logs
          </Typography>

          {shifts.length === 0 ? (
            <Box className="py-12 text-center text-gray-400">
              <MdPointOfSale size={48} className="mx-auto mb-2 opacity-40" />
              <Typography variant="body1" fontWeight={600}>No shift handover records yet</Typography>
              <Typography variant="caption">Record closing drawer balance during front desk staff shift changes</Typography>
            </Box>
          ) : (
            <div className="divide-y divide-gray-100">
              {shifts.map((s) => (
                <div key={s.id} className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {dayjs(s.shiftDate).format("DD MMM YYYY")} · {s.shiftType} Shift
                      </span>
                      <Chip
                        size="small"
                        label={`Handover by: ${s.staffName}`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      Logged at {dayjs(s.createdAt).format("DD MMM, hh:mm A")}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs">
                    <div>
                      <div className="text-gray-500">Opening Float</div>
                      <div className="font-bold text-slate-800">{formatCurrency(s.openingCash)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">+ Cash Collected</div>
                      <div className="font-bold text-emerald-600">+{formatCurrency(s.cashCollected)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">- Petty Expenses</div>
                      <div className="font-bold text-rose-600">-{formatCurrency(s.pettyExpensesPaid)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Expected Closing</div>
                      <div className="font-bold text-slate-900">{formatCurrency(s.closingCashExpected)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Actual Counted</div>
                      <div className={`font-black ${s.cashDifference === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                        {formatCurrency(s.actualCashCounted)}{" "}
                        {s.cashDifference !== 0 && (
                          <span className="text-[10px]">({s.cashDifference > 0 ? "+" : ""}{s.cashDifference})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {s.handoverNotes && (
                    <div className="mt-2 text-xs text-slate-600 italic">
                      "Notes: {s.handoverNotes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionBox>
      )}

      {/* ADD / EDIT STAFF MODAL */}
      <UiDialog open={openStaffModal} onClose={() => setOpenStaffModal(false)} title="Employee Profile" maxWidth="xs">
        <form onSubmit={handleStaffSubmit} className="space-y-4 pt-1">
          <TextField
            label="Employee Full Name *"
            required
            fullWidth
            size="small"
            value={staffForm.name || ""}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Department / Role</InputLabel>
            <Select
              value={staffForm.role || "RECEPTIONIST"}
              label="Department / Role"
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as StaffRole })}
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Mobile Number *"
            required
            fullWidth
            size="small"
            value={staffForm.phone || ""}
            onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Shift Assignment</InputLabel>
            <Select
              value={staffForm.shift || "FULL_DAY"}
              label="Shift Assignment"
              onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value as ShiftType })}
            >
              <MenuItem value="MORNING">Morning (7 AM - 3 PM)</MenuItem>
              <MenuItem value="EVENING">Evening (3 PM - 11 PM)</MenuItem>
              <MenuItem value="NIGHT">Night (11 PM - 7 AM)</MenuItem>
              <MenuItem value="FULL_DAY">Full Day (General Shift)</MenuItem>
            </Select>
          </FormControl>

          <DialogActions className="!px-0 !pt-2">
            <Button onClick={() => setOpenStaffModal(false)} color="inherit">Cancel</Button>
            <UISubmitButton type="submit" text="Save Employee" loading={isSavingStaff} />
          </DialogActions>
        </form>
      </UiDialog>

      {/* SHIFT REGISTER HANDOVER MODAL */}
      <UiDialog open={openShiftModal} onClose={() => setOpenShiftModal(false)} title="Record Shift Cash Handover" maxWidth="sm">
        <form onSubmit={handleShiftSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Shift Date"
              type="date"
              fullWidth
              size="small"
              value={shiftForm.shiftDate}
              onChange={(e) => setShiftForm({ ...shiftForm, shiftDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Shift Type</InputLabel>
              <Select
                value={shiftForm.shiftType}
                label="Shift Type"
                onChange={(e) => setShiftForm({ ...shiftForm, shiftType: e.target.value as ShiftType })}
              >
                <MenuItem value="MORNING">Morning Shift</MenuItem>
                <MenuItem value="EVENING">Evening Shift</MenuItem>
                <MenuItem value="NIGHT">Night Shift</MenuItem>
              </Select>
            </FormControl>
          </div>

          <TextField
            label="Outgoing Receptionist Name *"
            required
            fullWidth
            size="small"
            value={shiftForm.staffName}
            onChange={(e) => setShiftForm({ ...shiftForm, staffName: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-3">
            <TextField
              label="Opening Float (₹)"
              type="number"
              fullWidth
              size="small"
              value={shiftForm.openingCash}
              onChange={(e) => setShiftForm({ ...shiftForm, openingCash: Number(e.target.value) })}
            />
            <TextField
              label="Cash Collected (₹)"
              type="number"
              fullWidth
              size="small"
              value={shiftForm.cashCollected}
              onChange={(e) => setShiftForm({ ...shiftForm, cashCollected: Number(e.target.value) })}
            />
            <TextField
              label="Petty Expenses (₹)"
              type="number"
              fullWidth
              size="small"
              value={shiftForm.pettyExpensesPaid}
              onChange={(e) => setShiftForm({ ...shiftForm, pettyExpensesPaid: Number(e.target.value) })}
            />
          </div>

          <div className="rounded-lg bg-slate-100 p-3 flex items-center justify-between text-xs">
            <div>
              <div className="text-gray-500 font-medium">Calculated System Expected Cash:</div>
              <div className="text-base font-black text-slate-900">{formatCurrency(expectedClosing)}</div>
            </div>
            <div>
              <div className="text-gray-500 font-medium">Drawer Variance:</div>
              <div className={`font-black text-sm ${cashVariance === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {cashVariance === 0 ? "Perfect Match (₹0)" : `${cashVariance > 0 ? "+" : ""}${formatCurrency(cashVariance)}`}
              </div>
            </div>
          </div>

          <TextField
            label="Actual Cash Counted in Physical Drawer (₹) *"
            type="number"
            required
            fullWidth
            size="small"
            value={shiftForm.actualCashCounted}
            onChange={(e) => setShiftForm({ ...shiftForm, actualCashCounted: Number(e.target.value) })}
          />

          <TextField
            label="Shift Handover Notes & Pending Tasks"
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="Room keys, night arrivals, open maintenance or special guest instructions"
            value={shiftForm.handoverNotes}
            onChange={(e) => setShiftForm({ ...shiftForm, handoverNotes: e.target.value })}
          />

          <DialogActions className="!px-0 !pt-2">
            <Button onClick={() => setOpenShiftModal(false)} color="inherit">Cancel</Button>
            <UISubmitButton type="submit" color="secondary" text="Save Shift Handover" loading={isSavingShift} />
          </DialogActions>
        </form>
      </UiDialog>
    </MainContainer>
  );
}
