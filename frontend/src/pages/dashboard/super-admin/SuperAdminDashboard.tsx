import { useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import DashboardModeBar, { type DashboardMode } from "../components/DashboardModeBar";
import PortfolioHero from "../components/PortfolioHero";
import SuperAdminKpiBanner from "./SuperAdminKpiBanner";
import MultiPropertyLiveGrid from "./MultiPropertyLiveGrid";
import ChainConsolidatedReports from "./ChainConsolidatedReports";
import RoleGovernanceSection from "./RoleGovernanceSection";
import CrossPropertyAddRoomModal from "./CrossPropertyAddRoomModal";
import { NewHotelModal } from "../../chain-portfolio/components/NewHotelModal";
import { EditHotelModal } from "../../chain-portfolio/components/EditHotelModal";
import StaffDialog from "../../staff/components/StaffDialog";
import {
  useGetPropertiesQuery,
  useSwitchActivePropertyMutation,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from "../../../store/services/property/propertySlice";
import { useGetStaffListQuery, useSaveStaffMemberMutation } from "../../../store/services/staff/staffSlice";
import type { HotelProperty, StaffMember } from "../../../utils/interfaces/Interface";
import { getErrorMessage } from "../../../utils/helper/helper";

interface SuperAdminDashboardProps {
  onSwitchToFrontDesk?: () => void;
}

export default function SuperAdminDashboard({ onSwitchToFrontDesk }: SuperAdminDashboardProps) {
  const reduceMotion = useReducedMotion();
  const { data: properties = [] } = useGetPropertiesQuery();
  const { data: staffList = [] } = useGetStaffListQuery();

  const [switchProperty, { isLoading: isSwitching }] = useSwitchActivePropertyMutation();
  const [createProperty, { isLoading: isCreatingProp }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: isUpdatingProp }] = useUpdatePropertyMutation();
  const [deleteProperty] = useDeletePropertyMutation();
  const [saveStaff, { isLoading: isSavingStaff }] = useSaveStaffMemberMutation();

  const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<HotelProperty | null>(null);
  const [addRoomTarget, setAddRoomTarget] = useState<HotelProperty | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [mode, setMode] = useState<DashboardMode>("overview");
  const [newStaffForm, setNewStaffForm] = useState<Partial<StaffMember>>({ role: "RECEPTIONIST", status: "ON_DUTY" });

  const handleSwitch = async (prop: HotelProperty) => {
    try {
      await switchProperty(prop.id).unwrap();
      toast.success(`Switched active desk to ${prop.name}`);
      if (onSwitchToFrontDesk) onSwitchToFrontDesk();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleStatus = async (prop: HotelProperty) => {
    try {
      const nextStatus = prop.status === "MAINTENANCE" ? "ACTIVE" : "MAINTENANCE";
      await updateProperty({ ...prop, status: nextStatus }).unwrap();
      toast.success(`${prop.name} status updated to ${nextStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteProperty = async (prop: HotelProperty) => {
    if (!window.confirm(`Permanently remove ${prop.name} from the chain portfolio?`)) return;
    try {
      await deleteProperty(prop.id).unwrap();
      toast.success(`Property ${prop.name} deleted`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCreateHotel = async (data: Partial<HotelProperty>) => {
    try {
      await createProperty(data).unwrap();
      toast.success("New hotel property added to portfolio!");
      setIsAddHotelOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUpdateHotel = async (data: HotelProperty) => {
    try {
      await updateProperty(data).unwrap();
      toast.success("Property details updated successfully!");
      setEditingProperty(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name?.trim()) return toast.error("Please enter staff member name");
    try {
      await saveStaff({
        ...newStaffForm,
        name: newStaffForm.name.trim(),
        role: newStaffForm.role || "RECEPTIONIST",
        phone: newStaffForm.phone?.trim() || "+91 9800000000",
        propertyName: newStaffForm.propertyName || "Chain-wide (All Properties)",
      }).unwrap();
      toast.success("New team member onboarded!");
      setIsAddStaffOpen(false);
      setNewStaffForm({ role: "RECEPTIONIST", status: "ON_DUTY" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PortfolioHero
        propertyCount={properties.length}
        roomCount={properties.reduce((total, property) => total + (property.roomCount || 0), 0)}
        staffCount={staffList.length}
        onAddRooms={() => {
          setAddRoomTarget(null);
          setIsAddRoomOpen(true);
        }}
        onAddHotel={() => setIsAddHotelOpen(true)}
        onOpenFrontDesk={onSwitchToFrontDesk}
      />

      <DashboardModeBar value={mode} onChange={setMode} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={mode}
          id="dashboard-mode-panel"
          role="tabpanel"
          aria-labelledby={`dashboard-tab-${mode}`}
          className="space-y-6"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {mode === "overview" || mode === "revenue" ? <SuperAdminKpiBanner properties={properties} /> : null}

          {mode === "overview" || mode === "hotels" ? (
            <MultiPropertyLiveGrid
              properties={properties}
              onAddRoom={(property) => {
                setAddRoomTarget(property);
                setIsAddRoomOpen(true);
              }}
              onEditProperty={(property) => setEditingProperty(property)}
              onDeleteProperty={handleDeleteProperty}
              onSwitchProperty={handleSwitch}
              onToggleStatus={handleToggleStatus}
              isSwitching={isSwitching}
            />
          ) : null}

          {mode === "revenue" ? <ChainConsolidatedReports properties={properties} /> : null}

          {mode === "team" ? (
            <RoleGovernanceSection
              staffList={staffList}
              properties={properties}
              onOpenAddStaff={() => setIsAddStaffOpen(true)}
            />
          ) : null}
        </motion.section>
      </AnimatePresence>

      {/* Modals */}
      <NewHotelModal
        open={isAddHotelOpen}
        onClose={() => setIsAddHotelOpen(false)}
        onSubmit={handleCreateHotel}
        isLoading={isCreatingProp}
      />

      <EditHotelModal
        property={editingProperty}
        open={Boolean(editingProperty)}
        onClose={() => setEditingProperty(null)}
        onSubmit={handleUpdateHotel}
        isLoading={isUpdatingProp}
      />

      <CrossPropertyAddRoomModal
        open={isAddRoomOpen}
        onClose={() => {
          setIsAddRoomOpen(false);
          setAddRoomTarget(null);
        }}
        properties={properties}
        initialProperty={addRoomTarget}
      />

      <StaffDialog
        open={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        form={newStaffForm}
        setForm={setNewStaffForm}
        onSubmit={handleAddStaffSubmit}
        loading={isSavingStaff}
      />
    </div>
  );
}
