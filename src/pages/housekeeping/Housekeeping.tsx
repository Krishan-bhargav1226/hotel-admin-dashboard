import { useState, useMemo } from "react";
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
  MdCleaningServices,
  MdBuild,
  MdCheckCircle,
  MdWarning,
  MdAdd,
  MdPerson,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import SectionBox from "../../components/ui/container/SectionBox";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import UiDialog from "../../components/ui/models/UiDialog";
import {
  useCreateMaintenanceTicketMutation,
  useGetHousekeepingTasksQuery,
  useGetMaintenanceTicketsQuery,
  useUpdateHousekeepingStatusMutation,
  useUpdateMaintenanceTicketMutation,
} from "../../store/services/housekeeping/housekeepingSlice";
import { useGetStaffListQuery } from "../../store/services/staff/staffSlice";
import { useGetRoomsQuery } from "../../store/services/room/roomSlice";
import { formatCurrency, getErrorMessage } from "../../utils/helper/helper";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import type {
  HousekeepingStatus,
  MaintenancePriority,
} from "../../utils/interfaces/Interface";

const STATUS_CONFIG: Record<
  HousekeepingStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  CLEAN_INSPECTED: {
    label: "Clean & Ready",
    bg: "bg-emerald-50 text-emerald-700",
    color: "#10B981",
    border: "border-emerald-400",
  },
  CLEANING: {
    label: "Cleaning in Progress",
    bg: "bg-sky-50 text-sky-700",
    color: "#0EA5E9",
    border: "border-sky-400",
  },
  DIRTY: {
    label: "Needs Cleaning (Dirty)",
    bg: "bg-amber-50 text-amber-700",
    color: "#F59E0B",
    border: "border-amber-400",
  },
  OUT_OF_ORDER: {
    label: "Out of Order / Repair",
    bg: "bg-rose-50 text-rose-700",
    color: "#EF4444",
    border: "border-rose-400",
  },
};

export default function Housekeeping() {
  const { data: tasks = [] } = useGetHousekeepingTasksQuery();
  const { data: maintenanceTickets = [] } = useGetMaintenanceTicketsQuery();
  const { data: staff = [] } = useGetStaffListQuery();
  const { data: rooms = [] } = useGetRoomsQuery();

  const [updateStatus] = useUpdateHousekeepingStatusMutation();
  const [createTicket, { isLoading: isCreatingTicket }] = useCreateMaintenanceTicketMutation();
  const [updateTicket] = useUpdateMaintenanceTicketMutation();

  const [activeTab, setActiveTab] = useState(0);
  const [filterCleanStatus, setFilterCleanStatus] = useState<string>("ALL");
  const [openTicketModal, setOpenTicketModal] = useState(false);

  // Maintenance form
  const [ticketForm, setTicketForm] = useState({
    roomId: "",
    title: "",
    description: "",
    priority: "MEDIUM" as MaintenancePriority,
    reportedBy: "Front Desk Staff",
    assignedTo: "Kishore Kumar",
    cost: 0,
  });

  const staffOptions = useMemo(
    () => staff.filter((s) => s.role === "HOUSEKEEPING" || s.role === "MAINTENANCE"),
    [staff]
  );

  const filteredTasks = useMemo(() => {
    if (filterCleanStatus === "ALL") return tasks;
    return tasks.filter((t) => t.status === filterCleanStatus);
  }, [tasks, filterCleanStatus]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const clean = tasks.filter((t) => t.status === "CLEAN_INSPECTED").length;
    const dirty = tasks.filter((t) => t.status === "DIRTY").length;
    const cleaning = tasks.filter((t) => t.status === "CLEANING").length;
    const ooo = tasks.filter((t) => t.status === "OUT_OF_ORDER").length;
    const openTickets = maintenanceTickets.filter((m) => m.status !== "RESOLVED").length;
    return { total, clean, dirty, cleaning, ooo, openTickets };
  }, [tasks, maintenanceTickets]);

  const handleStatusChange = async (roomId: string, status: HousekeepingStatus) => {
    try {
      await updateStatus({ roomId, status }).unwrap();
      toast.success(`Room status updated to ${STATUS_CONFIG[status].label}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.roomId || !ticketForm.title) {
      toast.error("Please select a room and enter issue title");
      return;
    }
    try {
      await createTicket({
        ...ticketForm,
        cost: Number(ticketForm.cost),
      }).unwrap();
      toast.success("Maintenance issue logged successfully");
      setOpenTicketModal(false);
      setTicketForm({
        roomId: "",
        title: "",
        description: "",
        priority: "MEDIUM",
        reportedBy: "Front Desk Staff",
        assignedTo: "Kishore Kumar",
        cost: 0,
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <MainContainer>
      <Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <PageTitle title={APP_TEXT.titles.HOUSEKEEPING} />
          <Typography variant="body2" className="text-gray-500">
            Real-time room cleanliness, housekeeping workflows, and maintenance issues
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
            <Tab icon={<MdCleaningServices size={18} />} iconPosition="start" label="Housekeeping Board" />
            <Tab icon={<MdBuild size={18} />} iconPosition="start" label={`Maintenance (${stats.openTickets})`} />
          </Tabs>
          {activeTab === 1 && (
            <UISubmitButton
              type="button"
              color="danger"
              text="Report Issue"
              startIcon={<MdAdd size={18} />}
              onClick={() => {
                if (rooms.length > 0 && !ticketForm.roomId) {
                  setTicketForm((prev) => ({ ...prev, roomId: rooms[0].id }));
                }
                setOpenTicketModal(true);
              }}
            />
          )}
        </Box>
      </Box>

      {/* KPI Ribbon */}
      <Box className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-4">
        <SectionBox className="!p-3 border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Clean & Ready</Typography>
          <Typography variant="h5" fontWeight={800} className="text-emerald-600">{stats.clean}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-sky-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">In Cleaning</Typography>
          <Typography variant="h5" fontWeight={800} className="text-sky-600">{stats.cleaning}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-amber-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Needs Cleaning (Dirty)</Typography>
          <Typography variant="h5" fontWeight={800} className="text-amber-600">{stats.dirty}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-rose-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Out of Order</Typography>
          <Typography variant="h5" fontWeight={800} className="text-rose-600">{stats.ooo}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-indigo-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Open Repairs</Typography>
          <Typography variant="h5" fontWeight={800} className="text-indigo-900">{stats.openTickets}</Typography>
        </SectionBox>
      </Box>

      {/* TAB 0: HOUSEKEEPING BOARD */}
      {activeTab === 0 && (
        <Box>
          <Box className="flex items-center gap-2 mb-4 flex-wrap">
            {["ALL", "CLEAN_INSPECTED", "CLEANING", "DIRTY", "OUT_OF_ORDER"].map((st) => (
              <Chip
                key={st}
                label={st === "ALL" ? "All Rooms" : STATUS_CONFIG[st as HousekeepingStatus]?.label}
                clickable
                color={filterCleanStatus === st ? "primary" : "default"}
                variant={filterCleanStatus === st ? "filled" : "outlined"}
                onClick={() => setFilterCleanStatus(st)}
                sx={{ fontWeight: 600, fontSize: "0.8rem" }}
              />
            ))}
          </Box>

          <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredTasks.map((task) => {
              const conf = STATUS_CONFIG[task.status] || STATUS_CONFIG.CLEAN_INSPECTED;
              return (
                <SectionBox
                  key={task.roomId}
                  className={`bg-white shadow-sm rounded-xl border-t-4 ${conf.border} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xl font-extrabold text-slate-900">Room {task.roomNumber}</span>
                        <div className="text-xs text-gray-500 font-medium">{task.roomTypeName}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${conf.bg}`}>
                        {conf.label}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MdPerson className="text-gray-400" size={15} />
                        <span>Assigned: <strong>{task.assignedTo || "Unassigned"}</strong></span>
                      </div>
                      {task.priority === "RUSH" && (
                        <div className="text-rose-600 font-bold flex items-center gap-1">
                          <MdWarning /> Rush Clean (Guest arriving soon)
                        </div>
                      )}
                      {task.notes && (
                        <div className="bg-slate-50 p-2 rounded text-slate-700 italic border">
                          "{task.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex flex-wrap gap-1.5">
                    {task.status !== "CLEAN_INSPECTED" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={<MdCheckCircle />}
                        onClick={() => handleStatusChange(task.roomId, "CLEAN_INSPECTED")}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                      >
                        Mark Clean & Ready
                      </Button>
                    )}
                    {task.status !== "CLEANING" && task.status !== "OUT_OF_ORDER" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        className="flex-1"
                        onClick={() => handleStatusChange(task.roomId, "CLEANING")}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Start Cleaning
                      </Button>
                    )}
                    {task.status !== "DIRTY" && task.status !== "OUT_OF_ORDER" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        className="flex-1"
                        onClick={() => handleStatusChange(task.roomId, "DIRTY")}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Mark Dirty
                      </Button>
                    )}
                  </div>
                </SectionBox>
              );
            })}
          </Box>
        </Box>
      )}

      {/* TAB 1: MAINTENANCE & REPAIRS */}
      {activeTab === 1 && (
        <SectionBox className="bg-white shadow-sm rounded-xl">
          <Typography variant="h6" fontWeight={700} className="mb-3 text-slate-900">
            Maintenance & Engineering Work Orders
          </Typography>

          {maintenanceTickets.length === 0 ? (
            <Box className="py-12 text-center text-gray-400">
              <MdBuild size={48} className="mx-auto mb-2 opacity-40" />
              <Typography variant="body1" fontWeight={600}>No active maintenance tickets</Typography>
              <Typography variant="caption">All hotel room amenities & equipments are functional</Typography>
            </Box>
          ) : (
            <div className="divide-y divide-gray-100">
              {maintenanceTickets.map((ticket) => {
                const isResolved = ticket.status === "RESOLVED";
                return (
                  <div key={ticket.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{ticket.ticketNo}</span>
                        <Chip
                          size="small"
                          label={`Room ${ticket.roomNumber}`}
                          color="primary"
                          sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                        />
                        <Chip
                          size="small"
                          label={ticket.priority}
                          color={ticket.priority === "HIGH" || ticket.priority === "EMERGENCY" ? "error" : "warning"}
                          sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                        />
                        <Chip
                          size="small"
                          label={ticket.status}
                          color={isResolved ? "success" : "default"}
                          sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                        />
                      </div>
                      <h4 className="font-bold text-slate-900 mt-1">{ticket.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{ticket.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>Reported by: <strong>{ticket.reportedBy}</strong></span>
                        <span>Assigned: <strong>{ticket.assignedTo || "Unassigned"}</strong></span>
                        {ticket.cost ? <span>Cost: <strong>{formatCurrency(ticket.cost)}</strong></span> : null}
                        <span>Logged: {dayjs(ticket.createdAt).format("DD MMM, hh:mm A")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isResolved && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<MdCheckCircle />}
                          onClick={async () => {
                            await updateTicket({ id: ticket.id, status: "RESOLVED" });
                            toast.success(`Ticket ${ticket.ticketNo} marked resolved and room restored`);
                          }}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          Resolve & Clear Room
                        </Button>
                      )}
                      {ticket.status === "OPEN" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={async () => {
                            await updateTicket({ id: ticket.id, status: "IN_PROGRESS" });
                            toast.success("Ticket set to In Progress");
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Start Work
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionBox>
      )}

      {/* REPORT ISSUE DIALOG */}
      <UiDialog open={openTicketModal} onClose={() => setOpenTicketModal(false)} title="Log Room Maintenance Issue" maxWidth="sm">
        <form onSubmit={handleCreateTicketSubmit} className="space-y-4 pt-2">
          <FormControl fullWidth size="small" required>
            <InputLabel>Select Room</InputLabel>
            <Select
              value={ticketForm.roomId}
              label="Select Room"
              onChange={(e) => setTicketForm({ ...ticketForm, roomId: e.target.value })}
            >
              {rooms.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  Room {r.number} ({r.floor})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Issue Title *"
            required
            fullWidth
            size="small"
            placeholder="e.g. Split AC not cooling / TV remote unresponsive"
            value={ticketForm.title}
            onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
          />

          <TextField
            label="Detailed Description"
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="Explain the problem observed"
            value={ticketForm.description}
            onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={ticketForm.priority}
                label="Priority"
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as MaintenancePriority })}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High (Puts Room Under Maintenance)</MenuItem>
                <MenuItem value="EMERGENCY">Emergency</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Assign Technician</InputLabel>
              <Select
                value={ticketForm.assignedTo}
                label="Assign Technician"
                onChange={(e) => setTicketForm({ ...ticketForm, assignedTo: e.target.value })}
              >
                {staffOptions.map((s) => (
                  <MenuItem key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </MenuItem>
                ))}
                <MenuItem value="External Vendor">External Authorized Vendor</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Reported By"
              fullWidth
              size="small"
              value={ticketForm.reportedBy}
              onChange={(e) => setTicketForm({ ...ticketForm, reportedBy: e.target.value })}
            />
            <TextField
              label="Estimated Cost (₹)"
              type="number"
              fullWidth
              size="small"
              value={ticketForm.cost}
              onChange={(e) => setTicketForm({ ...ticketForm, cost: Number(e.target.value) })}
            />
          </div>

          <DialogActions className="!px-0 !pt-3">
            <Button onClick={() => setOpenTicketModal(false)} color="inherit">Cancel</Button>
            <UISubmitButton type="submit" color="danger" text="Create Ticket" loading={isCreatingTicket} />
          </DialogActions>
        </form>
      </UiDialog>
    </MainContainer>
  );
}
