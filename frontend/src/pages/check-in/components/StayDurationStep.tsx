import { useFormikContext } from "formik";
import { computeExpectedCheckOut, describePlan } from "../../../utils/helper/billing";
import { formatDateTime, fromLocalInput } from "../../../utils/date/dateUtils";
import type { RatePlan } from "../../../utils/interfaces/Interface";
import { plansForDuration } from "../planMatch";
import type { CheckInFormValues, DurationType } from "../types";
import { cn } from "../../../lib/utils";

interface StayDurationStepProps {
  roomPlans: RatePlan[];
  onDurationChange: (duration: DurationType) => void;
}

const DURATIONS: { id: DurationType; label: string }[] = [
  { id: "HOURLY", label: "Hourly" },
  { id: "12_HOURS", label: "Day" },
  { id: "FULL_DAY", label: "24 hours" },
];

export default function StayDurationStep({ roomPlans, onDurationChange }: StayDurationStepProps) {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  const choices = plansForDuration(values.durationType, roomPlans);
  const activePlan = roomPlans.find((plan) => plan.id === values.planId) ?? choices[0];
  const checkout = activePlan && values.checkInAt ? computeExpectedCheckOut(activePlan, fromLocalInput(values.checkInAt)) : null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">How long</h2>
      <div role="radiogroup" aria-label="Length of stay" className="mt-4 grid grid-cols-3 gap-2">
        {DURATIONS.map((duration) => {
          const match = plansForDuration(duration.id, roomPlans)[0];
          const selected = values.durationType === duration.id;
          return (
            <button
              key={duration.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!match}
              onClick={() => onDurationChange(duration.id)}
              className={cn(
                "flex min-h-16 cursor-pointer flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-40",
                selected
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
              )}
            >
              <span className="text-sm font-semibold">{duration.label}</span>
              <span className={cn("mt-0.5 text-xs", selected ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
                {match ? describePlan(match) : "No plan"}
              </span>
            </button>
          );
        })}
      </div>

      {choices.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Rate plan">
          {choices.map((plan) => {
            const selected = values.planId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setFieldValue("planId", plan.id)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                  selected
                    ? "border-brand-700 bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {plan.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        {activePlan
          ? checkout
            ? `${activePlan.name} · out ${formatDateTime(checkout)}`
            : `${activePlan.name} · billed by the hour`
          : "Add a rate plan before checking anyone in."}
      </p>
    </section>
  );
}
