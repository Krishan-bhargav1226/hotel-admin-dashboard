import { useState } from "react";
import { useFormikContext } from "formik";
import { ChevronDown, Clock } from "lucide-react";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { PAYMENT_MODES } from "../../../utils/helper/constants";
import { toLocalInput } from "../../../utils/date/dateUtils";
import dayjs from "dayjs";
import { cn } from "../../../lib/utils";
import type { CheckInFormValues } from "../types";

export default function MoreDetails() {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  const [open, setOpen] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const collecting = Number(values.advanceAmount) > 0;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-[var(--card)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="check-in-more"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/40"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">Advance payment & Desk notes</span>
          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
            {collecting ? `Advance: ₹${values.advanceAmount} (${values.advanceMode})` : "Optional advance, arrival time, desk notes"}
          </span>
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id="check-in-more" className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-700">
          {/* Advance & Payment Mode */}
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              name="advanceAmount"
              label="Advance collected (₹)"
              type="number"
              placeholder="0 if guest pays at checkout"
            />
            {collecting ? (
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-slate-800 dark:text-slate-200">Payment mode</span>
                <div className="flex gap-1.5" role="radiogroup" aria-label="Payment mode">
                  {PAYMENT_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      role="radio"
                      aria-checked={values.advanceMode === mode.id}
                      onClick={() => setFieldValue("advanceMode", mode.id)}
                      className={cn(
                        "h-11 flex-1 cursor-pointer rounded-lg border text-xs font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                        values.advanceMode === mode.id
                          ? "border-brand-700 bg-brand-700 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
                      )}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Desk Notes */}
          <TextInput
            name="notes"
            label="Desk Note"
            multiline
            rows={2}
            placeholder="E.g. Extra pillow, quiet room, late departure request"
          />

          {/* Arrival Time */}
          {showTime ? (
            <div>
              <TextInput name="checkInAt" label="Arrival time" type="datetime-local" required />
              <button
                type="button"
                onClick={() => setFieldValue("checkInAt", toLocalInput(dayjs().toISOString()))}
                className="mt-1 cursor-pointer text-xs font-semibold text-brand-800 hover:text-brand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-brand-200"
              >
                Use current time
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowTime(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 hover:text-brand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:text-brand-300"
            >
              <Clock className="size-3.5" />
              <span>Change arrival time (defaults to now)</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
