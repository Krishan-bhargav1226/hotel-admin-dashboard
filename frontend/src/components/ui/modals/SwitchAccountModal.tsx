import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../utils/auth/authContextDef";
import { AppEndPoints } from "../../../utils/route-endpoints/AppEndPoints";

interface SwitchAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SwitchAccountModal({ open, onClose }: SwitchAccountModalProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleSwitch = () => {
    logout();
    onClose();
    navigate(AppEndPoints.LOGIN, { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Change account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign out of {user?.email || "this session"} and sign in with another hotel account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSwitch}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
