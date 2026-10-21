import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { maskId } from "../../utils/helper/helper";

interface MaskedIdProps {
  value?: string | null;
  className?: string;
}

/** Shows the last 4 characters until the clerk taps Show. */
export default function MaskedId({ value, className = "" }: MaskedIdProps) {
  const [open, setOpen] = useState(false);
  if (!value) return <span className={className}>-</span>;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="font-mono text-xs tracking-wide">{open ? value : maskId(value)}</span>
      <button
        type="button"
        aria-pressed={open}
        aria-label={open ? "Hide ID number" : "Show ID number"}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        {open ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </span>
  );
}
