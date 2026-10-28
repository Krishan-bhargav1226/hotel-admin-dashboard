import { KeyRound, LogIn } from "lucide-react";
import RenderTable from "../../../components/tables/RenderTable";
import TablePaginationControls from "../../../components/tables/TablePaginationControls";
import LoadingTable from "../../../components/constants/LoadingTable";
import StayCard from "./StayCard";
import StayTableRow from "./StayTableRow";
import type { StayTabFilter, StayViewMode } from "./stayTypes";
import type { Room, Stay } from "../../../utils/interfaces/Interface";
import type { BillBreakdown } from "../../../utils/interfaces/Interface";

const COLUMNS = ["Sr", "Stay ID", "Guest Profile", "Room / Cat", "Tariff Plan", "Check-In", "Check-Out / Expected", "Folio Balance", "Status", "Actions"].map((label) => ({ label }));

interface StayResultsProps {
  loading: boolean;
  view: StayViewMode;
  tab: StayTabFilter;
  filtered: Stay[];
  pageItems: Stay[];
  rooms: Room[];
  now: number;
  offset: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  getBill: (stay: Stay) => BillBreakdown | null;
  onNewCheckIn: () => void;
  onView: (stay: Stay) => void;
  onRoomService: () => void;
  onCheckout: (stay: Stay) => void;
  onDelete: (stay: Stay) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function StayResults(props: StayResultsProps) {
  const { loading, view, tab, filtered, pageItems, rooms, now, offset, pageNumber, pageSize, totalPages, totalCount, getBill, onNewCheckIn, onView, onRoomService, onCheckout, onDelete, onPageChange, onPageSizeChange } = props;
  return <>
    {loading && <div className="py-16 text-center text-slate-400"><LoadingTable /></div>}
    {!loading && filtered.length === 0 && <EmptyStays tab={tab} onNewCheckIn={onNewCheckIn} />}
    {!loading && view === "GRID" && filtered.length > 0 && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {pageItems.map((stay) => <StayCard key={stay.id} stay={stay} room={rooms.find((room) => room.id === stay.roomId)} bill={getBill(stay)} now={now} onView={() => onView(stay)} onRoomService={onRoomService} onCheckout={() => onCheckout(stay)} onDelete={() => onDelete(stay)} />)}
    </div>}
    {!loading && view === "TABLE" && filtered.length > 0 && <RenderTable columns={COLUMNS}>{pageItems.map((stay, index) => <StayTableRow key={stay.id} stay={stay} rowIndex={index} rowNumber={offset + index + 1} room={rooms.find((room) => room.id === stay.roomId)} bill={getBill(stay)} onView={() => onView(stay)} onCheckout={() => onCheckout(stay)} onDelete={() => onDelete(stay)} />)}</RenderTable>}
    <div className="mt-5 border-t border-slate-100 pt-4"><TablePaginationControls pageNumber={pageNumber} pageSize={pageSize} totalPages={totalPages} totalCount={totalCount} onPageChange={onPageChange} onRowsPerPageChange={(event) => onPageSizeChange(parseInt(event.target.value, 10))} /></div>
  </>;
}

function EmptyStays({ tab, onNewCheckIn }: { tab: StayTabFilter; onNewCheckIn: () => void }) {
  const activeTab = tab === "ACTIVE";
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><KeyRound size={24} /></div>
    <h3 className="text-sm font-bold text-slate-800">{activeTab ? "No active in-house guests currently" : "No matching stay records found"}</h3>
    <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">{activeTab ? "All rooms are currently vacant or turnover cleaning." : "Try clearing search filters or selecting another date range."}</p>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
      {activeTab && <button type="button" onClick={onNewCheckIn} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-brand-500"><LogIn size={15} /><span>New Guest Check-In</span></button>}
    </div>
  </div>;
}
