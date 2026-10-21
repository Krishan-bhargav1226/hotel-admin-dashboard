import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Settings2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

interface EditHotelModalProps {
  property: HotelProperty | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HotelProperty) => Promise<void>;
  isLoading: boolean;
}

export function EditHotelModal({ property, open, onClose, onSubmit, isLoading }: EditHotelModalProps) {
  const [form, setForm] = useState<Partial<HotelProperty>>({});

  useEffect(() => {
    if (property) {
      setForm({ ...property });
    }
  }, [property]);

  if (!open || !property) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error("Hotel name cannot be empty");

    await onSubmit({
      ...property,
      ...form,
      roomCount: Number(form.roomCount) || property.roomCount,
      occupancyRate: typeof form.occupancyRate === "number" ? form.occupancyRate : property.occupancyRate,
      adr: Number(form.adr) || property.adr,
      dailyRevenue: Number(form.dailyRevenue) || property.dailyRevenue,
    } as HotelProperty);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings2 className="size-5 text-brand-700 dark:text-brand-300" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Customize Property Parameters</h3>
              <p className="text-xs text-slate-500 font-mono">{property.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Property / Hotel Name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name || ""}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Brand Tier / Category</label>
              <input
                type="text"
                name="brandTier"
                value={form.brandTier || ""}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-amber-700 font-semibold dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">City / Location</label>
              <input
                type="text"
                name="location"
                value={form.location || ""}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Room Inventory (Keys)</label>
              <input
                type="number"
                name="roomCount"
                value={form.roomCount || 0}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Average Rate (ADR ₹)</label>
              <input
                type="number"
                name="adr"
                value={form.adr || 5000}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Physical Address</label>
            <input
              type="text"
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">GSTIN Credential</label>
              <input
                type="text"
                name="gstin"
                value={form.gstin || ""}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">UPI VPA</label>
              <input
                type="text"
                name="upiId"
                value={form.upiId || ""}
                onChange={handleChange}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" type="submit" loading={isLoading} className="font-semibold">
              Save Customizations
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
