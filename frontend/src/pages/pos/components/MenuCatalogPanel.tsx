import type { Dispatch, SetStateAction } from "react";
import { MdCleaningServices, MdDelete, MdEdit, MdFastfood, MdLocalCafe, MdLocalDining, MdLocalTaxi, MdRestaurant } from "react-icons/md";
import { formatCurrency } from "../../../utils/helper/helper";
import type { MenuCategory, MenuItem } from "../../../utils/interfaces/Interface";

const CATEGORIES: Record<MenuCategory, string> = {
  BREAKFAST: "Breakfast", MAIN_COURSE: "Main Course & Meals", SNACKS: "Snacks & Starters",
  BEVERAGES: "Beverages & Coffee", LAUNDRY: "Laundry & Ironing", EXTRA_SERVICE: "Amenities & Taxi",
};
const FILTERS = ["ALL", "BREAKFAST", "MAIN_COURSE", "SNACKS", "BEVERAGES", "LAUNDRY", "EXTRA_SERVICE"];

interface MenuCatalogPanelProps {
  items: MenuItem[];
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export default function MenuCatalogPanel({ items, filter, setFilter, search, setSearch, onEdit, onDelete }: MenuCatalogPanelProps) {
  const visibleItems = items.filter((item) => filter === "ALL" || item.category === filter).filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section id="menu-panel" role="tabpanel" aria-labelledby="menu-tab" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-panel">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((category) => <button key={category} type="button" onClick={() => setFilter(category)} className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-all ${filter === category ? "bg-brand-700 font-bold text-white shadow-2xs" : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}>{category === "ALL" ? "All Items" : CATEGORIES[category as MenuCategory]}</button>)}
        </div>
        <input type="search" placeholder="Search dishes or services..." aria-label="Search menu items" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 sm:w-56" />
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleItems.map((item) => <MenuItemCard key={item.id} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />)}
      </div>
    </section>
  );
}

function MenuItemCard({ item, onEdit, onDelete }: { item: MenuItem; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-2xs">
      <div>
        <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-1.5">{categoryIcon(item.category)}<span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">{CATEGORIES[item.category]}</span></div><span className="font-mono text-xs font-bold text-slate-900">{formatCurrency(item.price)}</span></div>
        <h3 className="mt-1 text-sm font-bold text-slate-900">{item.name}</h3>
        {item.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.description}</p>}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-2.5">
        <span className={`text-[10px] font-semibold ${item.isAvailable ? "text-emerald-700" : "text-rose-500"}`}>{item.isAvailable ? "● In Stock" : "○ Sold Out"}</span>
        <div className="flex items-center gap-1"><button type="button" onClick={onEdit} className="cursor-pointer rounded p-1 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900" title="Edit item"><MdEdit size={15} /></button><button type="button" onClick={onDelete} className="cursor-pointer rounded p-1 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600" title="Delete item"><MdDelete size={15} /></button></div>
      </div>
    </article>
  );
}

function categoryIcon(category: MenuCategory) {
  switch (category) {
    case "BREAKFAST": return <MdLocalDining size={14} className="text-amber-600" />;
    case "MAIN_COURSE": return <MdRestaurant size={14} className="text-rose-600" />;
    case "SNACKS": return <MdFastfood size={14} className="text-orange-600" />;
    case "BEVERAGES": return <MdLocalCafe size={14} className="text-sky-600" />;
    case "LAUNDRY": return <MdCleaningServices size={14} className="text-brand-600" />;
    case "EXTRA_SERVICE": return <MdLocalTaxi size={14} className="text-emerald-600" />;
  }
}
