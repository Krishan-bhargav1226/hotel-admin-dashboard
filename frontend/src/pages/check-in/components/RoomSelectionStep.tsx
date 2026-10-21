import { useCallback, useMemo, useState } from "react";
import { useFormikContext } from "formik";
import { Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Room, RoomType } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";

interface RoomSelectionStepProps {
  availableRooms: Room[];
  roomTypes: RoomType[];
}

export default function RoomSelectionStep({ availableRooms, roomTypes }: RoomSelectionStepProps) {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  const [query, setQuery] = useState("");
  const needed = Math.max(1, values.roomsBooked || 1);
  const selectedIds = values.roomIds;
  const typeName = useCallback((room: Room) => roomTypes.find((type) => type.id === room.roomTypeId)?.name ?? "Room", [roomTypes]);

  const rooms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = availableRooms.filter((room) => {
      if (!needle) return true;
      if (selectedIds.includes(room.id)) return true;
      return [room.number, room.floor, typeName(room)].join(" ").toLowerCase().includes(needle);
    });
    return [...matched].sort((a, b) => {
      const aSelected = selectedIds.includes(a.id);
      const bSelected = selectedIds.includes(b.id);
      if (aSelected !== bSelected) return aSelected ? -1 : 1;
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    });
  }, [availableRooms, query, typeName, selectedIds]);

  const toggleRoom = (roomId: string) => {
    if (needed === 1) {
      void setFieldValue("roomIds", [roomId]);
      return;
    }
    const already = selectedIds.includes(roomId);
    if (already) {
      void setFieldValue(
        "roomIds",
        selectedIds.filter((id) => id !== roomId),
      );
      return;
    }
    if (selectedIds.length >= needed) {
      void setFieldValue("roomIds", [...selectedIds.slice(1), roomId]);
      return;
    }
    void setFieldValue("roomIds", [...selectedIds, roomId]);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Room{needed > 1 ? "s" : ""}</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {needed > 1 ? `Pick ${needed} rooms · ${selectedIds.length} selected` : "Pick one free room"}
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{availableRooms.length} free</span>
      </div>

      {availableRooms.length > 6 ? (
        <label className="mt-4 flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
          <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by number or type"
            aria-label="Search rooms"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          />
        </label>
      ) : null}

      {availableRooms.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No rooms are free. Mark one clean on the board, then come back.</p>
      ) : rooms.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No room matches that search.</p>
      ) : (
        <div className="mt-3 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3" role="listbox" aria-label="Available rooms" aria-multiselectable={needed > 1}>
          {rooms.map((room) => {
            const selected = selectedIds.includes(room.id);
            const order = selected ? selectedIds.indexOf(room.id) + 1 : 0;
            return (
              <button
                key={room.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggleRoom(room.id)}
                className={cn(
                  "flex min-h-[4.75rem] cursor-pointer flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                  selected
                    ? "border-brand-700 bg-brand-50 ring-1 ring-brand-700 dark:bg-brand-900/20"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:hover:bg-slate-800/60",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-mono text-lg font-bold tabular-nums leading-none text-slate-900 dark:text-slate-50">{room.number}</span>
                  {selected ? (
                    <span className="text-[11px] font-semibold text-brand-800 dark:text-brand-200">
                      {needed > 1 ? `#${order}` : "Selected"}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-200">Free</span>
                  )}
                </span>
                <span className="mt-1 w-full truncate text-xs text-slate-700 dark:text-slate-200">{typeName(room)}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{room.floor}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
