import type { Dispatch, SetStateAction } from "react";
import { MdGridView, MdViewList, MdSearch } from "react-icons/md";
import InBetweenDateSearch from "../../../components/forms/InBetweenDateSearch";
import type { DateRangeValue } from "../../../components/forms/dateRangePresets";
import type { StayTabFilter, StayViewMode } from "./stayTypes";

interface StayFiltersProps {
  tab: StayTabFilter;
  setTab: Dispatch<SetStateAction<StayTabFilter>>;
  view: StayViewMode;
  setView: Dispatch<SetStateAction<StayViewMode>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  range: DateRangeValue;
  setRange: Dispatch<SetStateAction<DateRangeValue>>;
  activeCount: number;
  departingCount: number;
  completedCount: number;
  allCount: number;
  resetPage: () => void;
}

const FILTERS: { key: StayTabFilter; label: string }[] = [
  { key: "ACTIVE", label: "Active In-House" },
  { key: "DEPARTING_TODAY", label: "Departing Today" },
  { key: "COMPLETED", label: "Past Checkouts Archive" },
  { key: "ALL", label: "All Records" },
];

export default function StayFilters(props: StayFiltersProps) {
  const { tab, setTab, view, setView, search, setSearch, range, setRange, activeCount, departingCount, completedCount, allCount, resetPage } = props;
  const counts: Record<StayTabFilter, number> = { ACTIVE: activeCount, DEPARTING_TODAY: departingCount, COMPLETED: completedCount, ALL: allCount };

  return <>
    <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1">
        {FILTERS.map(({ key, label }) => <button key={key} type="button" onClick={() => { setTab(key); resetPage(); }} className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${tab === key ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}>{label} ({counts[key]})</button>)}
      </div>
      <div className="flex items-center gap-2"><div className="inline-flex rounded-xl bg-slate-100 p-1">
        <ViewButton label="Grid view" active={view === "GRID"} onClick={() => setView("GRID")}><MdGridView size={16} /></ViewButton>
        <ViewButton label="Table view" active={view === "TABLE"} onClick={() => setView("TABLE")}><MdViewList size={16} /></ViewButton>
      </div></div>
    </div>
    <div className="mb-5 flex flex-wrap items-center gap-2.5">
      <label className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:w-80"><MdSearch size={16} className="shrink-0 text-slate-400" /><input type="search" aria-label="Search stays" placeholder="Search guest, mobile, room, stay ID..." value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} className="ml-2 flex-1 bg-transparent text-xs text-slate-900 focus:outline-none" /></label>
      <InBetweenDateSearch value={range} defaultPreset="all" onChange={(value) => { setRange(value); resetPage(); }} />
    </div>
  </>;
}

function ViewButton({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} aria-pressed={active} onClick={onClick} className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{children}</button>;
}
