import { UserCheck, UserPlus } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { CustomerType } from "../types";

interface GuestLookupToggleProps {
  value: CustomerType;
  onChange: (value: CustomerType) => void;
  disabled?: boolean;
}

export default function GuestLookupToggle({ value, onChange, disabled }: GuestLookupToggleProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-[var(--card)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">Step 1</span>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Has the guest visited before?</h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">Quick counter check</span>
      </div>

      <div role="radiogroup" aria-label="Guest visit type" className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {/* Option 1: Yes, Returning Guest (Repeat) */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "REPEAT"}
          disabled={disabled}
          onClick={() => onChange("REPEAT")}
          className={cn(
            "group relative flex min-h-16 cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50",
            value === "REPEAT"
              ? "border-brand-700 bg-brand-50/70 shadow-sm ring-1 ring-brand-700 dark:border-brand-500 dark:bg-brand-950/40 dark:ring-brand-500"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80",
          )}
        >
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              value === "REPEAT"
                ? "bg-brand-700 text-white dark:bg-brand-600"
                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700",
            )}
          >
            <UserCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">Yes, Returning Guest</span>
              {value === "REPEAT" && (
                <span className="rounded-full bg-brand-700 px-1.5 py-0.2 text-[10px] font-bold text-white dark:bg-brand-500">
                  Active
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Look up via 10-digit mobile number to auto-fill details and ID
            </p>
          </div>
        </button>

        {/* Option 2: No, New Guest */}
        <button
          type="button"
          role="radio"
          aria-checked={value === "NEW"}
          disabled={disabled}
          onClick={() => onChange("NEW")}
          className={cn(
            "group relative flex min-h-16 cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50",
            value === "NEW"
              ? "border-brand-700 bg-brand-50/70 shadow-sm ring-1 ring-brand-700 dark:border-brand-500 dark:bg-brand-950/40 dark:ring-brand-500"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80",
          )}
        >
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              value === "NEW"
                ? "bg-brand-700 text-white dark:bg-brand-600"
                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700",
            )}
          >
            <UserPlus className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-50">No, New Guest</span>
              {value === "NEW" && (
                <span className="rounded-full bg-brand-700 px-1.5 py-0.2 text-[10px] font-bold text-white dark:bg-brand-500">
                  Active
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Register Solo, Couple (18+ DOB), or Family adult guests
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
