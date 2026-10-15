import { useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Guest, Reservation, Room, Stay } from "../../../utils/interfaces/Interface";
import SearchResults from "./SearchResults";

interface GlobalSearchProps {
  query: string;
  setQuery: (value: string) => void;
  focused: boolean;
  setFocused: (focused: boolean) => void;
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  stays: Stay[];
  onNavigate: (path: string) => void;
}

export default function GlobalSearch({ query, setQuery, focused, setFocused, rooms, guests, reservations, stays, onNavigate }: GlobalSearchProps) {
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return null;
    return {
      rooms: rooms.filter((room) => room.number.toLowerCase().includes(term)).slice(0, 3),
      guests: guests.filter((guest) => guest.name.toLowerCase().includes(term) || guest.phone.includes(term)).slice(0, 4),
      bookings: reservations.filter((booking) => booking.bookingNo.toLowerCase().includes(term) || booking.guestName.toLowerCase().includes(term)).slice(0, 3),
      stays: stays.filter((stay) => stay.stayNo.toLowerCase().includes(term) || stay.guestName.toLowerCase().includes(term)).slice(0, 3),
    };
  }, [query, rooms, guests, reservations, stays]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
      if (event.key === "Escape") setFocused(false);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setFocused]);

  return <div className="relative flex min-w-0 flex-1 items-center gap-2">
    <div className={cn("flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 transition-colors duration-200 sm:max-w-md", focused ? "border-brand-600 bg-white ring-2 ring-brand-500/20 dark:bg-slate-900" : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900")}>
      <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <input id="global-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} placeholder="Search room, guest, booking" aria-label="Search rooms, guests, and bookings" className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100" />
      <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 md:inline dark:border-slate-700 dark:bg-slate-800">Ctrl+K</kbd>
    </div>
    {focused && results && <div className="absolute left-12 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card"><SearchResults results={results} onNavigate={onNavigate} /></div>}
  </div>;
}
