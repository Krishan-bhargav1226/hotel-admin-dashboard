import { useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Package, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { LostAndFoundCategory } from "../../../utils/interfaces/Interface";
import { CATEGORIES } from "../lostFoundConstants";

interface NewArticleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: LostAndFoundCategory;
    locationFound: string;
    foundDate: string;
    foundTime: string;
    foundByStaff: string;
    storageLocker: string;
    guestName?: string;
    guestPhone?: string;
    status: "SECURED" | "GUEST_NOTIFIED";
    notes?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export function NewArticleModal({ open, onClose, onSubmit, isLoading }: NewArticleModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<LostAndFoundCategory>("ELECTRONICS");
  const [location, setLocation] = useState("");
  const [staff, setStaff] = useState("");
  const [locker, setLocker] = useState("Locker A-01");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please enter the item title");
    if (!location.trim()) return toast.error("Please enter where the item was found");
    if (!staff.trim()) return toast.error("Please enter staff member who found it");

    await onSubmit({
      title: title.trim(),
      category,
      locationFound: location.trim(),
      foundDate: dayjs().format("YYYY-MM-DD"),
      foundTime: dayjs().format("hh:mm A"),
      foundByStaff: staff.trim(),
      storageLocker: locker.trim(),
      guestName: guestName.trim() || undefined,
      guestPhone: guestPhone.trim() || undefined,
      status: guestName ? "GUEST_NOTIFIED" : "SECURED",
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-brand-700 dark:text-brand-300" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Found Property</h3>
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
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Article Title / Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apple Watch Series 8 Gold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LostAndFoundCategory)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 dark:border-slate-700 dark:bg-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Found Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Room 204 or Lobby"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Found By (Staff) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar (HK)"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Storage Custody Locker</label>
              <input
                type="text"
                value={locker}
                onChange={(e) => setLocker(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Guest Name (Optional)</label>
              <input
                type="text"
                placeholder="If identified"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Guest Phone</label>
              <input
                type="text"
                placeholder="+91..."
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="Physical condition, distinguishing marks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" type="submit" loading={isLoading} className="font-semibold">
              Log Article to Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
