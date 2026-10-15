const CATEGORIES = [
  { id: "ALL", label: (count: number) => `All Rooms (${count})` }, { id: "COUPLE", label: () => "Couples & Romance" },
  { id: "SOLO", label: () => "Business & Solo" }, { id: "FAMILY", label: () => "Family Suites" },
  { id: "ACCESSIBLE", label: () => "Accessible / Seniors" }, { id: "PRESIDENTIAL", label: () => "VIP Penthouse" }, { id: "BUDGET", label: () => "Budget Transit" },
];

export default function RoomCategoryFilter({ selected, count, onChange }: { selected: string; count: number; onChange: (category: string) => void }) {
  return <div className="mb-6 flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xs">
    <span className="px-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">Filter by Guest Type:</span>
    {CATEGORIES.map((category) => <button key={category.id} type="button" onClick={() => onChange(category.id)} className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${selected === category.id ? "bg-brand-700 font-bold text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>{category.label(count)}</button>)}
  </div>;
}
