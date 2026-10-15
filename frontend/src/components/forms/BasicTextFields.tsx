import { useField } from "formik";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { fieldClass } from "../ui/fieldStyles";

interface TextInputProps {
  name: string;
  label: string;
  type?: "text" | "password" | "email" | "number" | "date" | "time" | "datetime-local" | "tel";
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  digitsOnly?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  helper?: string;
  onValueChange?: (value: string) => void;
}

export const TextInput = ({
  name,
  label,
  type = "text",
  multiline = false,
  rows = 3,
  required = false,
  disabled = false,
  placeholder,
  autoFocus,
  maxLength,
  digitsOnly = false,
  prefix,
  suffix,
  helper,
  onValueChange,
}: TextInputProps) => {
  const [field, meta, helpers] = useField(name);
  const showError = Boolean(meta.touched && meta.error);
  const describedBy = showError ? `${name}-error` : helper ? `${name}-help` : undefined;

  const onChange = (value: string) => {
    let next = value;
    if (digitsOnly) next = next.replace(/\D/g, "");
    if (maxLength) next = next.slice(0, maxLength);
    helpers.setValue(next);
    onValueChange?.(next);
  };

  const controlClass = cn(
    fieldClass,
    "h-auto min-h-10 py-2",
    prefix && "pl-9",
    suffix && "pr-9",
    showError && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"
  );

  return (
    <div className="mb-2 grid gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      <div className="relative">
        {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span> : null}
        {multiline ? (
          <textarea
            {...field}
            id={name}
            value={field.value ?? ""}
            rows={rows}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={disabled}
            required={required}
            aria-invalid={showError || undefined}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
            className={cn(controlClass, "resize-y")}
          />
        ) : (
          <input
            {...field}
            id={name}
            value={field.value ?? ""}
            type={type}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={disabled}
            required={required}
            inputMode={digitsOnly ? "numeric" : undefined}
            min={type === "number" ? 0 : undefined}
            aria-invalid={showError || undefined}
            aria-describedby={describedBy}
            onChange={(e) => onChange(e.target.value)}
            className={controlClass}
          />
        )}
        {suffix ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{suffix}</span> : null}
      </div>
      {showError ? (
        <p id={`${name}-error`} className="text-xs text-rose-600" role="alert">
          {meta.error}
        </p>
      ) : helper ? (
        <p id={`${name}-help`} className="text-xs text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
};
