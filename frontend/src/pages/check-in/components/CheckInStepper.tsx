import { CheckCircle2, UserCheck, BedDouble, Receipt } from "lucide-react";
import { cn } from "../../../lib/utils";

interface CheckInStepperProps {
  currentStep: number; // 1, 2, 3
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, title: "1. Guest & ID", icon: UserCheck, hint: "Guest identity & government IDs" },
  { step: 2, title: "2. Room & Plan", icon: BedDouble, hint: "Select room & stay duration" },
  { step: 3, title: "3. Review & Payment", icon: Receipt, hint: "Review summary & confirm check-in" },
];

export default function CheckInStepper({ currentStep, onStepClick }: CheckInStepperProps) {
  return (
    <nav aria-label="Check-in progress" className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-[var(--card)]">
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {STEPS.map((item) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const Icon = isDone ? CheckCircle2 : item.icon;

          return (
            <li key={item.step}>
              <button
                type="button"
                disabled={!onStepClick}
                onClick={() => onStepClick?.(item.step)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-default",
                  isCurrent
                    ? "bg-brand-50 text-brand-900 ring-1 ring-brand-700 dark:bg-brand-950/40 dark:text-brand-100 dark:ring-brand-500"
                    : isDone
                      ? "text-emerald-700 hover:bg-slate-50 dark:text-emerald-400 dark:hover:bg-slate-800"
                      : "text-slate-400 opacity-60 dark:text-slate-500",
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                    isCurrent
                      ? "bg-brand-700 text-white dark:bg-brand-600"
                      : isDone
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="hidden min-w-0 flex-1 sm:block">
                  <p className="truncate text-xs font-semibold leading-none">{item.title}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{item.hint}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
