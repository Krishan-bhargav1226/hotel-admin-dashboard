import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { fieldClass } from "../../../components/ui/fieldStyles";
import { cn } from "../../../lib/utils";
import { maskId } from "../../../utils/helper/helper";

/** ID stays hidden on a shared counter screen until the clerk chooses to show it. */
export default function IdNumberField() {
  const [field, meta, helpers] = useField<string>("idNumber");
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const showError = Boolean(meta.touched && meta.error);
  const value = field.value ?? "";
  const visible = pinned || focused || !value;

  return (
    <div className="mb-2 grid gap-1.5">
      <label htmlFor="idNumber" className="text-sm font-medium text-slate-900 dark:text-slate-100">
        ID number<span className="text-rose-600"> *</span>
      </label>
      <div className="relative">
        <input
          {...field}
          id="idNumber"
          value={value}
          autoComplete="off"
          placeholder="As printed on the card"
          aria-invalid={showError || undefined}
          aria-describedby={showError ? "idNumber-error" : undefined}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            field.onBlur(event);
            setFocused(false);
          }}
          onChange={(event) => helpers.setValue(event.target.value)}
          className={cn(fieldClass, "pr-12 font-mono", !visible && "text-transparent caret-transparent", showError && "border-rose-400")}
        />
        {!visible ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm tracking-wide text-slate-900 dark:text-slate-100">
            {maskId(value)}
          </span>
        ) : null}
        <button
          type="button"
          aria-pressed={pinned}
          aria-label={pinned ? "Hide ID number" : "Show ID number"}
          onClick={() => setPinned((current) => !current)}
          className="absolute inset-y-0 right-0 inline-flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-slate-800"
        >
          {pinned ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {showError ? (
        <p id="idNumber-error" className="text-xs text-rose-600" role="alert">
          {meta.error}
        </p>
      ) : (
        <p className="text-xs text-slate-500">Hidden on this screen. Tap the eye to check the card.</p>
      )}
    </div>
  );
}
