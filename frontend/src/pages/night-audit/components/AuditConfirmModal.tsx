import { Moon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { formatCurrency } from "../../../utils/helper/helper";

interface AuditConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  businessDate: string;
  grossRevenue: number;
  occupancyPercent: number;
}

export function AuditConfirmModal({
  open,
  onClose,
  onConfirm,
  isLoading,
  businessDate,
  grossRevenue,
  occupancyPercent,
}: AuditConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <Moon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Execute End-of-Day Audit</h3>
            <p className="text-xs text-slate-500">Business Date: {businessDate}</p>
          </div>
        </div>

        <div className="my-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex justify-between">
            <span className="text-slate-500">House Occupancy:</span>
            <strong>{occupancyPercent}%</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Gross Day Revenue:</span>
            <strong className="text-emerald-600">{formatCurrency(grossRevenue)}</strong>
          </div>
          <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-500 dark:border-slate-800">
            Automated steps: posts room rates to active folios, balances cash/UPI drawers, and rolls the system
            calendar.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={onConfirm} loading={isLoading} className="font-semibold">
            Confirm & Run Audit
          </Button>
        </div>
      </div>
    </div>
  );
}
