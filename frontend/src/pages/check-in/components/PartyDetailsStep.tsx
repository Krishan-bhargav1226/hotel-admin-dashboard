import { useFormikContext } from "formik";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { PARTY_TYPES, type CheckInFormValues, type PartyType } from "../types";

export default function PartyDetailsStep() {
  const { values, setFieldValue, setValues } = useFormikContext<CheckInFormValues>();

  const setPartyType = (partyType: PartyType) => {
    const preset = PARTY_TYPES.find((item) => item.id === partyType);
    const guestCount = preset?.guests ?? 1;
    setValues({
      ...values,
      partyType,
      guestCount,
      roomsBooked: Math.max(1, Math.min(values.roomsBooked, guestCount)),
      roomIds: values.roomIds.slice(0, Math.max(1, Math.min(values.roomsBooked, guestCount))),
    });
  };

  const bump = (field: "guestCount" | "roomsBooked", delta: number) => {
    const min = 1;
    const max = field === "guestCount" ? 20 : 10;
    const next = Math.min(max, Math.max(min, values[field] + delta));
    if (field === "roomsBooked") {
      setValues({
        ...values,
        roomsBooked: next,
        roomIds: values.roomIds.slice(0, next),
      });
      return;
    }
    void setFieldValue("guestCount", next);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Party</h2>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Who is staying, and how many rooms they need.</p>

      <div role="radiogroup" aria-label="Guest type" className="mt-4 grid grid-cols-3 gap-2">
        {PARTY_TYPES.map((party) => {
          const selected = values.partyType === party.id;
          return (
            <button
              key={party.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPartyType(party.id)}
              className={cn(
                "flex min-h-14 cursor-pointer flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                selected
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
              )}
            >
              <span className="text-sm font-semibold">{party.label}</span>
              <span className={cn("mt-0.5 text-xs", selected ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
                {party.guests === 1 ? "1 guest" : `About ${party.guests}`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <CountControl
          label="Number of guests"
          value={values.guestCount}
          onDecrease={() => bump("guestCount", -1)}
          onIncrease={() => bump("guestCount", 1)}
        />
        <CountControl
          label="Rooms booked"
          value={values.roomsBooked}
          onDecrease={() => bump("roomsBooked", -1)}
          onIncrease={() => bump("roomsBooked", 1)}
        />
      </div>
    </section>
  );
}

function CountControl({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
      <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={onDecrease}
          disabled={value <= 1}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span className="min-w-8 text-center text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={onIncrease}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
