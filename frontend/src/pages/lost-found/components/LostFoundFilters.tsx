import { Search } from "lucide-react";
import { CATEGORIES } from "../lostFoundConstants";

interface LostFoundFiltersProps {
  query: string;
  setQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (stat: string) => void;
}

export function LostFoundFilters({
  query,
  setQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
}: LostFoundFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by article, room, staff..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="ALL">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="ALL">All Statuses</option>
          <option value="SECURED">Secured in Locker</option>
          <option value="GUEST_NOTIFIED">Guest Notified</option>
          <option value="CLAIMED">Claimed & Returned</option>
          <option value="DISPOSED">Disposed</option>
        </select>
      </div>
    </div>
  );
}
