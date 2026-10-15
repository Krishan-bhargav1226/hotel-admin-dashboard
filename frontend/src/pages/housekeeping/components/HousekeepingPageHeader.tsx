import { Tab, Tabs } from "@mui/material";
import { MdAdd, MdBuild, MdCleaningServices, MdGridView, MdViewKanban } from "react-icons/md";
import PageTitle from "../../../components/ui/container/PageTitle";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { APP_TEXT } from "../../../utils/text/DefaultAppText.utils";

type ViewMode = "KANBAN" | "FLOOR_GRID";
interface HousekeepingPageHeaderProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  openTickets: number;
  onReportIssue: () => void;
}

export default function HousekeepingPageHeader({ activeTab, onTabChange, viewMode, onViewChange, openTickets, onReportIssue }: HousekeepingPageHeaderProps) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <PageTitle title={APP_TEXT.titles.HOUSEKEEPING} subtitle="Room turnover pipelines, 6-point sanitization checklists, rush arrival alerts, and maintenance tracking." />
    <div className="flex flex-wrap items-center gap-3">
      <Tabs value={activeTab} onChange={(_event, value) => onTabChange(value)} sx={{ bgcolor: "background.paper", borderRadius: "12px", border: "1px solid #E2E8F0", minHeight: 40, "& .MuiTab-root": { minHeight: 40, py: 1, px: 2.5, fontWeight: 700, fontSize: "0.85rem", textTransform: "none" } }}>
        <Tab icon={<MdCleaningServices size={18} />} iconPosition="start" label="Turnover Operations" />
        <Tab icon={<MdBuild size={18} />} iconPosition="start" label={`Repairs (${openTickets})`} />
      </Tabs>
      {activeTab === 0 ? <ViewSwitcher viewMode={viewMode} onViewChange={onViewChange} /> : <UISubmitButton type="button" color="danger" text="Report Issue" startIcon={<MdAdd size={18} />} onClick={onReportIssue} />}
    </div>
  </div>;
}

function ViewSwitcher({ viewMode, onViewChange }: { viewMode: ViewMode; onViewChange: (view: ViewMode) => void }) {
  return <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
    <button type="button" onClick={() => onViewChange("KANBAN")} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${viewMode === "KANBAN" ? "bg-white text-brand-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}><MdViewKanban size={16} /><span>Kanban Pipeline</span></button>
    <button type="button" onClick={() => onViewChange("FLOOR_GRID")} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${viewMode === "FLOOR_GRID" ? "bg-white text-brand-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}><MdGridView size={16} /><span>Floor Matrix</span></button>
  </div>;
}
