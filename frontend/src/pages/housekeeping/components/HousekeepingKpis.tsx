import { MdWarning } from "react-icons/md";

interface HousekeepingKpisProps {
  stats: { clean: number; cleaning: number; dirty: number; rushCount: number; openTickets: number; total: number };
}

export default function HousekeepingKpis({ stats }: HousekeepingKpisProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card border-l-4 border-l-emerald-500"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Clean & Ready</span><div className="flex items-baseline gap-2 mt-1"><span className="text-2xl font-bold font-mono text-emerald-600">{stats.clean}</span><span className="text-xs text-slate-400 font-medium">/ {stats.total} rooms</span></div></div>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card border-l-4 border-l-sky-500"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">In Cleaning</span><div className="flex items-baseline gap-2 mt-1"><span className="text-2xl font-bold font-mono text-sky-600">{stats.cleaning}</span><span className="text-xs text-slate-400 font-medium">active turnover</span></div></div>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card border-l-4 border-l-amber-500"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Needs Cleaning</span><div className="flex items-baseline gap-2 mt-1"><span className="text-2xl font-bold font-mono text-amber-600">{stats.dirty}</span><span className="text-xs text-slate-400 font-medium">pending turnover</span></div></div>
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-card border-l-4 border-l-rose-500"><span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1"><MdWarning size={12} />Rush Cleans Needed</span><div className="flex items-baseline gap-2 mt-1"><span className="text-2xl font-bold font-mono text-rose-700">{stats.rushCount}</span><span className="text-xs text-rose-600/80 font-medium">check-in imminent</span></div></div>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card border-l-4 border-l-brand-600"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Open Repairs</span><div className="flex items-baseline gap-2 mt-1"><span className="text-2xl font-bold font-mono text-brand-700">{stats.openTickets}</span><span className="text-xs text-slate-400 font-medium">work orders</span></div></div>
    </div>
  );
}
