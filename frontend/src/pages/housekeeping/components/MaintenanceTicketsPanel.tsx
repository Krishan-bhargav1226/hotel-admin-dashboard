import { Box, Button, Chip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { MdBuild, MdCheckCircle } from "react-icons/md";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { MaintenanceTicket } from "../../../utils/interfaces/Interface";

interface MaintenanceTicketsPanelProps {
  tickets: MaintenanceTicket[];
  onResolve: (ticket: MaintenanceTicket) => void;
  onStartWork: (ticket: MaintenanceTicket) => void;
}

export default function MaintenanceTicketsPanel({ tickets, onResolve, onStartWork }: MaintenanceTicketsPanelProps) {
  return (
    <SectionBox className="bg-white shadow-card rounded-2xl border border-slate-200/90 !p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100"><div><Typography variant="h6" fontWeight={700} className="text-slate-900">Maintenance & Engineering Work Orders</Typography><p className="text-xs text-slate-500 mt-0.5">Active plumbing, electrical, and appliance repair tickets</p></div></div>
      {tickets.length === 0 ? (
        <Box className="py-12 text-center text-gray-400"><MdBuild size={48} className="mx-auto mb-2 opacity-40" /><Typography variant="body1" fontWeight={600}>No active maintenance tickets</Typography><Typography variant="caption">All hotel room amenities & equipments are functional</Typography></Box>
      ) : (
        <div className="divide-y divide-gray-100">
          {tickets.map((ticket) => {
            const isResolved = ticket.status === "RESOLVED";
            return (
              <div key={ticket.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-slate-500">{ticket.ticketNo}</span><Chip size="small" label={`Room ${ticket.roomNumber}`} color="primary" sx={{ fontWeight: 800, fontSize: "0.75rem" }} /><Chip size="small" label={ticket.priority} color={ticket.priority === "HIGH" || ticket.priority === "EMERGENCY" ? "error" : "warning"} sx={{ fontWeight: 700, fontSize: "0.7rem" }} /><Chip size="small" label={ticket.status} color={isResolved ? "success" : "default"} sx={{ fontWeight: 700, fontSize: "0.7rem" }} /></div>
                  <h4 className="font-bold text-slate-900 mt-1">{ticket.title}</h4><p className="text-xs text-gray-600 mt-0.5">{ticket.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500"><span>Reported by: <strong>{ticket.reportedBy}</strong></span><span>Assigned: <strong>{ticket.assignedTo || "Unassigned"}</strong></span>{ticket.cost ? <span>Cost: <strong>{formatCurrency(ticket.cost)}</strong></span> : null}<span>Logged: {dayjs(ticket.createdAt).format("DD MMM, hh:mm A")}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  {!isResolved && <Button size="small" variant="contained" color="success" startIcon={<MdCheckCircle />} onClick={() => onResolve(ticket)} sx={{ textTransform: "none", fontWeight: 700 }}>Resolve & Clear Room</Button>}
                  {ticket.status === "OPEN" && <Button size="small" variant="outlined" color="primary" onClick={() => onStartWork(ticket)} sx={{ textTransform: "none" }}>Start Work</Button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionBox>
  );
}
