import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import MainContainer from "../../components/ui/container/MainContainer";
import InspectionDialog, { type InspectionChecklist } from "./components/InspectionDialog";
import MaintenanceDialog, { type MaintenanceFormValues } from "./components/MaintenanceDialog";
import HousekeepingKpis from "./components/HousekeepingKpis";
import HousekeepingPageHeader from "./components/HousekeepingPageHeader";
import TurnoverOperations from "./components/TurnoverOperations";
import MaintenanceTicketsPanel from "./components/MaintenanceTicketsPanel";
import { STATUS_CONFIG } from "./components/statusConfig";
import useHousekeepingData from "./useHousekeepingData";
import { useCreateMaintenanceTicketMutation, useGetHousekeepingTasksQuery, useGetMaintenanceTicketsQuery, useUpdateHousekeepingStatusMutation, useUpdateMaintenanceTicketMutation } from "../../store/services/housekeeping/housekeepingSlice";
import { useGetStaffListQuery } from "../../store/services/staff/staffSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { useGetReservationsQuery } from "../../store/services/reservation/reservationSlice";
import { getErrorMessage } from "../../utils/helper/helper";
import type { HousekeepingStatus, HousekeepingTask, MaintenancePriority } from "../../utils/interfaces/Interface";

type ViewMode = "KANBAN" | "FLOOR_GRID";
const DEFAULT_CHECKLIST: InspectionChecklist = { linen: true, bathroom: true, toiletries: true, electronics: true, refreshments: true, locks: true };
const EMPTY_TICKET: MaintenanceFormValues = { roomId: "", title: "", description: "", priority: "MEDIUM" as MaintenancePriority, reportedBy: "Front Desk Staff", assignedTo: "", cost: 0 };

export default function Housekeeping() {
  const { data: tasks = [] } = useGetHousekeepingTasksQuery();
  const { data: maintenanceTickets = [] } = useGetMaintenanceTicketsQuery();
  const { data: staff = [] } = useGetStaffListQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: reservations = [] } = useGetReservationsQuery();
  const [updateStatus] = useUpdateHousekeepingStatusMutation();
  const [createTicket, { isLoading: isCreatingTicket }] = useCreateMaintenanceTicketMutation();
  const [updateTicket] = useUpdateMaintenanceTicketMutation();
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("KANBAN");
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterCleanStatus, setFilterCleanStatus] = useState("ALL");
  const [filterStaff, setFilterStaff] = useState("ALL");
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [inspectionModalTask, setInspectionModalTask] = useState<HousekeepingTask | null>(null);
  const [checklist, setChecklist] = useState<InspectionChecklist>(DEFAULT_CHECKLIST);
  const [inspectorNotes, setInspectorNotes] = useState("");
  const [ticketForm, setTicketForm] = useState<MaintenanceFormValues>(EMPTY_TICKET);
  const { staffOptions, enrichedTasks, stats, filteredTasks, availableFloors } = useHousekeepingData({ tasks, tickets: maintenanceTickets, staff, rooms, reservations, filterFloor, filterStatus: filterCleanStatus, filterStaff });

  const handleStatusChange = async (roomId: string, status: HousekeepingStatus, assignedTo?: string) => {
    try { await updateStatus({ roomId, status, assignedTo }).unwrap(); toast.success(`Room status updated to ${STATUS_CONFIG[status].label}`); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleOpenInspection = (task: HousekeepingTask) => {
    setInspectionModalTask(task);
    setChecklist(DEFAULT_CHECKLIST);
    setInspectorNotes("");
  };

  const handleConfirmInspection = async () => {
    if (!inspectionModalTask) return;
    if (!Object.values(checklist).every(Boolean)) return toast.error("Please verify all 6 sanitization checklist items");
    try {
      await updateStatus({ roomId: inspectionModalTask.roomId, status: "CLEAN_INSPECTED", notes: inspectorNotes || "Verified clean and sanitized" }).unwrap();
      toast.success(`Room ${inspectionModalTask.roomNumber} certified clean and ready for guests!`);
      setInspectionModalTask(null);
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleCreateTicketSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ticketForm.roomId || !ticketForm.title) return toast.error("Please select a room and enter issue title");
    try {
      await createTicket({ ...ticketForm, cost: Number(ticketForm.cost) }).unwrap();
      toast.success("Maintenance issue logged successfully");
      setOpenTicketModal(false);
      setTicketForm(EMPTY_TICKET);
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleResolveTicket = async (ticket: (typeof maintenanceTickets)[number]) => {
    await updateTicket({ id: ticket.id, status: "RESOLVED" });
    toast.success(`Ticket ${ticket.ticketNo} marked resolved and room restored`);
  };
  const handleStartWork = async (ticket: (typeof maintenanceTickets)[number]) => {
    await updateTicket({ id: ticket.id, status: "IN_PROGRESS" });
    toast.success("Ticket set to In Progress");
  };
  const handleReportIssue = () => {
    const defaultStaff = staffOptions[0]?.name || "";
    setTicketForm((current) => ({
      ...current,
      roomId: current.roomId || rooms[0]?.id || "",
      assignedTo: current.assignedTo || defaultStaff,
    }));
    setOpenTicketModal(true);
  };

  return <MainContainer>
    <HousekeepingPageHeader activeTab={activeTab} onTabChange={setActiveTab} viewMode={viewMode} onViewChange={setViewMode} openTickets={stats.openTickets} onReportIssue={handleReportIssue} />
    <HousekeepingKpis stats={stats} />
    {activeTab === 0 && <TurnoverOperations viewMode={viewMode} filterFloor={filterFloor} setFilterFloor={setFilterFloor} filterCleanStatus={filterCleanStatus} setFilterCleanStatus={setFilterCleanStatus} filterStaff={filterStaff} setFilterStaff={setFilterStaff} availableFloors={availableFloors} staffOptions={staffOptions} enrichedTasks={enrichedTasks} filteredTasks={filteredTasks} handleStatusChange={handleStatusChange} handleOpenInspection={handleOpenInspection} />}
    {activeTab === 1 && <MaintenanceTicketsPanel tickets={maintenanceTickets} onResolve={handleResolveTicket} onStartWork={handleStartWork} />}
    <InspectionDialog task={inspectionModalTask} checklist={checklist} setChecklist={setChecklist} inspectorNotes={inspectorNotes} setInspectorNotes={setInspectorNotes} onClose={() => setInspectionModalTask(null)} onConfirm={handleConfirmInspection} />
    <MaintenanceDialog open={openTicketModal} onClose={() => setOpenTicketModal(false)} onSubmit={handleCreateTicketSubmit} form={ticketForm} setForm={setTicketForm} rooms={rooms} staff={staffOptions} isCreating={isCreatingTicket} />
  </MainContainer>;
}
