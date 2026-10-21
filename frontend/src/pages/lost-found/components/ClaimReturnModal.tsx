import { useState } from "react";
import toast from "react-hot-toast";
import { UserCheck, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { LostAndFoundItem } from "../../../utils/interfaces/Interface";

interface ClaimReturnModalProps {
  item: LostAndFoundItem | null;
  onClose: () => void;
  onSubmit: (item: LostAndFoundItem, claimantName: string, claimantContact: string) => Promise<void>;
}

export function ClaimReturnModal({ item, onClose, onSubmit }: ClaimReturnModalProps) {
  const [claimantName, setClaimantName] = useState(item?.guestName || "");
  const [claimantContact, setClaimantContact] = useState(item?.guestPhone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimantName.trim()) return toast.error("Please enter claimant name");

    setIsSubmitting(true);
    try {
      await onSubmit(item, claimantName.trim(), claimantContact.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Custody Handover</h3>
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
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900">
            <div className="font-mono text-[11px] font-bold text-brand-800 dark:text-brand-300">{item.itemNo}</div>
            <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
            <div className="text-[11px] text-slate-500">
              Found at {item.locationFound} · Locker: {item.storageLocker}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Claimant / Guest Full Name *</label>
            <input
              type="text"
              required
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Claimant Contact Phone / Government ID
            </label>
            <input
              type="text"
              placeholder="+91... or Aadhaar / Passport Ref"
              value={claimantContact}
              onChange={(e) => setClaimantContact(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" type="submit" loading={isSubmitting} className="font-semibold">
              Confirm Handover
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
