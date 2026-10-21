import { useMemo } from "react";
import { useFormikContext } from "formik";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import { formatFullDate } from "../../../utils/date/dateUtils";
import { ID_TYPES } from "../../../utils/helper/constants";
import type { GuestWithStats } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";
import IdNumberField from "./IdNumberField";

interface GuestDetailsStepProps {
  guests: GuestWithStats[];
  onPhoneChange: (phone: string) => void;
  onSelectGuest: (guest: GuestWithStats) => void;
}

export default function GuestDetailsStep({ guests, onPhoneChange, onSelectGuest }: GuestDetailsStepProps) {
  const { values } = useFormikContext<CheckInFormValues>();
  const matched = values.phone.length === 10 ? guests.find((guest) => guest.phone === values.phone) : undefined;
  const recent = useMemo(
    () => [...guests].sort((a, b) => (b.lastVisitAt ?? "").localeCompare(a.lastVisitAt ?? "")).slice(0, 4),
    [guests],
  );

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-[var(--card)]">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Guest</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextInput
          name="phone"
          label="Mobile number"
          type="tel"
          digitsOnly
          maxLength={10}
          required
          autoFocus
          prefix="+91"
          placeholder="10-digit mobile"
          autoComplete="off"
          onValueChange={onPhoneChange}
        />
        <TextInput name="name" label="Name" required placeholder="Guest name" autoComplete="name" />
        <SearchableSelectDropdown name="idType" label="ID type" options={ID_TYPES} required />
        <IdNumberField />
      </div>

      {matched ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          <span className="mr-2 inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            Repeat guest
          </span>
          {matched.visits} {matched.visits === 1 ? "previous stay" : "previous stays"}
          {matched.lastVisitAt ? ` · last ${formatFullDate(matched.lastVisitAt)}` : ""}
          {" · ID filled from the last visit"}
        </p>
      ) : null}

      {values.phone.length === 10 && !matched ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">New guest. Name and ID are enough to continue.</p>
      ) : null}

      {matched?.isFlagged ? (
        <p role="alert" className="mt-2 text-sm text-rose-800 dark:text-rose-200">
          This guest is flagged{matched.flagReason ? `: ${matched.flagReason}` : ""}. Check with the manager before handing over the key.
        </p>
      ) : null}

      {!matched && values.phone.length < 10 && recent.length > 0 ? (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Recent</span>
          {recent.map((guest) => (
            <button
              key={guest.id}
              type="button"
              onClick={() => onSelectGuest(guest)}
              className="min-h-11 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {guest.name}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
