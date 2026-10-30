import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Phone, User, Plus, Edit3, ArrowUpRight, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

interface MultiPropertyLiveGridProps {
  properties: HotelProperty[];
  onAddRoom: (property: HotelProperty) => void;
  onEditProperty: (property: HotelProperty) => void;
  onDeleteProperty: (property: HotelProperty) => void;
  onSwitchProperty: (property: HotelProperty) => void;
  onToggleStatus: (property: HotelProperty) => void;
  isSwitching?: boolean;
}

export default function MultiPropertyLiveGrid({
  properties,
  onAddRoom,
  onEditProperty,
  onDeleteProperty,
  onSwitchProperty,
  onToggleStatus,
  isSwitching,
}: MultiPropertyLiveGridProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Your properties
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update each hotel, switch its front desk, or add rooms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 xl:gap-5">
        {properties.map((prop, index) => {
          const occ = prop.occupancyRate || 0;
          const occupiedKeys = Math.round((occ / 100) * prop.roomCount);
          const rev = prop.dailyRevenue || 0;
          const adr = prop.adr || 0;
          const revPar = Math.round((occ / 100) * adr);

          const occColor =
            occ >= 85
              ? "bg-emerald-500 text-emerald-700"
              : occ >= 70
              ? "bg-blue-500 text-blue-700"
              : "bg-amber-500 text-amber-700";

          return (
            <motion.article
              key={prop.id}
              className={`relative flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-900 ${
                prop.active
                  ? "border-brand-600 ring-2 ring-brand-600/20 dark:border-brand-500"
                  : "border-slate-200/90 dark:border-slate-800"
              }`}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.32, delay: reduceMotion ? 0 : index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
            >
              {prop.active && (
                <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                  <CheckCircle2 className="size-3" /> Active Counter Desk
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400">
                      {prop.brandTier || "—"}
                    </span>
                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-white" title={prop.name}>
                      {prop.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="size-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{prop.location}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="shrink-0 font-medium text-amber-600 dark:text-amber-400">{prop.starRating}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleStatus(prop)}
                    title="Click to toggle status"
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                      prop.status === "MAINTENANCE"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : prop.status === "INACTIVE"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    }`}
                  >
                    {prop.status || "ACTIVE"}
                  </button>
                </div>

                {/* Occupancy bar */}
                <div className="mt-3.5 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5 dark:border-slate-800/60 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Live Occupancy</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {occ}% ({occupiedKeys}/{prop.roomCount} keys)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${occColor.split(" ")[0]}`}
                      style={{ width: `${Math.min(occ, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Financial Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Today's Rev</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      ₹{(rev / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Avg ADR</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">₹{adr}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">RevPAR</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">₹{revPar}</div>
                  </div>
                </div>

                {/* General Manager & Contact */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{prop.managerName || "—"}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Phone className="size-3 text-slate-400" />
                    <span>{prop.phone}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Plus}
                  className="h-8 flex-1 text-xs"
                  onClick={() => onAddRoom(prop)}
                >
                  Add Room
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  icon={Edit3}
                  className="h-8 flex-1 text-xs"
                  onClick={() => onEditProperty(prop)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={prop.active ? "secondary" : "primary"}
                  icon={ArrowUpRight}
                  className="h-8 flex-1 text-xs"
                  disabled={isSwitching}
                  onClick={() => onSwitchProperty(prop)}
                >
                  {prop.active ? "Active Desk" : "Launch"}
                </Button>
                {properties.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                    onClick={() => onDeleteProperty(prop)}
                  />
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
