import { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { MdAdd, MdPeople, MdPointOfSale } from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import StaffDirectory from "./components/StaffDirectory";
import ShiftRegisterList from "./components/ShiftRegisterList";
import StaffDialog from "./components/StaffDialog";
import ShiftHandoverDialog, { type ShiftFormValues } from "./components/ShiftHandoverDialog";
import {
  useCreateShiftRegisterMutation,
  useDeleteStaffMemberMutation,
  useGetShiftRegistersQuery,
  useGetStaffListQuery,
  useSaveStaffMemberMutation,
} from "../../store/services/staff/staffSlice";
import { getErrorMessage } from "../../utils/helper/helper";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import type { StaffMember, StaffRole } from "../../utils/interfaces/Interface";

const EMPTY_STAFF: Partial<StaffMember> = {
  name: "",
  role: "RECEPTIONIST",
  phone: "",
  shift: "MORNING",
  status: "ON_DUTY",
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
  const [staffForm, setStaffForm] = useState<Partial<StaffMember>>(EMPTY_STAFF);
  const [shiftForm, setShiftForm] = useState<ShiftFormValues>({
    shiftDate: dayjs().format("YYYY-MM-DD"),
    shiftType: "MORNING",
    staffName: "Aarav Sharma",
    openingCash: 5000,
    cashCollected: 12000,
    pettyExpensesPaid: 1200,
    actualCashCounted: 15800,
    handoverNotes: "All room keys accounted for. Night shift guest arriving around 11 PM.",
  });

  const expectedClosing = shiftForm.openingCash + shiftForm.cashCollected - shiftForm.pettyExpensesPaid;
  const cashVariance = shiftForm.actualCashCounted - expectedClosing;

  const handleStaffSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffForm.name || !staffForm.phone) {
      toast.error("Please enter staff name and phone number");
      return;
    }
    try {
      await saveStaff({ ...staffForm, name: staffForm.name, role: staffForm.role as StaffRole, phone: staffForm.phone }).unwrap();
      toast.success("Staff profile saved");
      setOpenStaffModal(false);
      setStaffForm(EMPTY_STAFF);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleShiftSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleToggleDuty = async (member: StaffMember) => {
    const isOnDuty = member.status === "ON_DUTY";
    await saveStaff({ ...member, status: isOnDuty ? "OFF_DUTY" : "ON_DUTY" });
    toast.success(`${member.name} is now ${isOnDuty ? "Off Duty" : "On Duty"}`);
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (!confirm(`Remove ${member.name} from staff directory?`)) return;
    await deleteStaff(member.id);
    toast.success("Staff member deleted");
  };

  return (
    <MainContainer>
      <Box className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <PageTitle title={APP_TEXT.titles.STAFF_SHIFTS} />
          <Typography variant="body2" className="text-gray-500">Hotel employee management, on-duty tracking, and cash drawer shift handover audit</Typography>
        </div>
        <Box className="flex items-center gap-2">
          <Tabs value={activeTab} onChange={(_event, value) => setActiveTab(value)} sx={{ bgcolor: "background.paper", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", minHeight: 40, "& .MuiTab-root": { minHeight: 40, py: 1, px: 2, fontWeight: 600, fontSize: "0.85rem" } }}>
            <Tab icon={<MdPeople size={18} />} iconPosition="start" label="Staff Directory" />
            <Tab icon={<MdPointOfSale size={18} />} iconPosition="start" label="Shift Drawer Handover" />
          </Tabs>
          {activeTab === 0 ? (
            <UISubmitButton type="button" color="primary" text="Add Staff Member" startIcon={<MdAdd size={18} />} onClick={() => { setStaffForm(EMPTY_STAFF); setOpenStaffModal(true); }} />
          ) : (
            <UISubmitButton type="button" color="secondary" text="New Shift Handover" startIcon={<MdPointOfSale size={18} />} onClick={() => setOpenShiftModal(true)} />
          )}
        </Box>
      </Box>

      {activeTab === 0 ? (
        <StaffDirectory
          staff={staffList}
          onToggleDuty={handleToggleDuty}
          onEdit={(member) => { setStaffForm(member); setOpenStaffModal(true); }}
          onDelete={handleDeleteStaff}
        />
      ) : <ShiftRegisterList shifts={shifts} />}

      <StaffDialog open={openStaffModal} onClose={() => setOpenStaffModal(false)} form={staffForm} setForm={setStaffForm} onSubmit={handleStaffSubmit} loading={isSavingStaff} />
      <ShiftHandoverDialog open={openShiftModal} onClose={() => setOpenShiftModal(false)} form={shiftForm} setForm={setShiftForm} onSubmit={handleShiftSubmit} loading={isSavingShift} expectedClosing={expectedClosing} cashVariance={cashVariance} />
    </MainContainer>
  );
}
