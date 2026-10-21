import { CheckCircle2, ExternalLink, MapPin, Phone, Settings2, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { formatCurrency } from "../../../utils/helper/helper";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

interface ChainPropertyCardProps {
  property: HotelProperty;
  onSwitch: (id: string) => void;
  onEdit: (property: HotelProperty) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function ChainPropertyCard({
  property,
  onSwitch,
  onEdit,
  onDelete,
  canDelete,
}: ChainPropertyCardProps) {
  const isSelected = property.active;
  const occ = property.occupancyRate || 0;
  const rev = property.dailyRevenue || Math.round(property.roomCount * (occ / 100) * (property.adr || 5500));

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all duration-200 ${
        isSelected
          ? "border-brand-500 bg-white ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-slate-900"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            {property.brandTier || "Luxury Collection"}
          </span>
          {isSelected ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Dashboard
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {property.starRating || "4 Star"}
            </span>
          )}
        </div>

        {/* Hotel Title & Location */}
        <div className="mt-3">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{property.name}</h4>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="my-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/50">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Rooms Inventory</div>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {property.roomCount} Keys
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Occupancy</div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold text-brand-700 dark:text-brand-300">{occ}%</span>
              <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-1.5 rounded-full bg-brand-600" style={{ width: `${occ}%` }} />
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Daily Revenue</div>
            <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(rev)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">ADR (Avg Rate)</div>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(property.adr || 5500)}
            </div>
          </div>
        </div>

        {/* Contact & Statutory Info */}
        <div className="space-y-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Phone className="size-3 shrink-0" />
            <span>{property.phone}</span>
          </div>
          <div className="flex justify-between font-mono text-[10px]">
            <span>GSTIN: {property.gstin}</span>
            <span>UPI: {property.upiId}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(property)}
            className="h-8 gap-1 px-2.5 text-xs font-semibold"
            title="Edit Property Customization"
          >
            <Settings2 className="size-3.5" />
            <span>Customize</span>
          </Button>

          {canDelete && !isSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(property.id)}
              className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              title="Remove Hotel from Portfolio"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>

        {isSelected ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
            <span>Active</span>
          </span>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => onSwitch(property.id)}
            className="h-8 gap-1.5 px-3 text-xs font-semibold"
          >
            <ExternalLink className="size-3.5" />
            <span>Launch Desk</span>
          </Button>
        )}
      </div>
    </div>
  );
}
