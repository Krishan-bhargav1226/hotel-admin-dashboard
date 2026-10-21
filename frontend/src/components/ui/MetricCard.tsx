import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

type MetricTone = "brand" | "positive" | "warning" | "neutral";

interface MetricCardProps {
  label: string;
  value: string | number;
  note: string;
  icon: ReactNode;
  tone?: MetricTone;
  to?: string;
  onClick?: () => void;
}

const tones: Record<MetricTone, { icon: string; value: string }> = {
  brand: {
    icon: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200",
    value: "text-brand-800 dark:text-brand-200",
  },
  positive: {
    icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
    value: "text-amber-700 dark:text-amber-300",
  },
  neutral: {
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    value: "text-slate-900 dark:text-slate-100",
  },
};

export default function MetricCard({ label, value, note, icon, tone = "neutral", to, onClick }: MetricCardProps) {
  const palette = tones[tone];
  const isInteractive = Boolean(to || onClick);
  const cardClassName = cn(
    "h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-panel transition-all duration-200 sm:p-5",
    isInteractive && "group-hover:border-brand-200 group-hover:shadow-card"
  );
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</h2>
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", palette.icon)}>
          {icon}
        </span>
      </div>
      <p className={cn("mt-3 truncate font-mono text-[1.35rem] font-bold leading-tight tracking-[-0.035em] tabular-nums sm:text-[1.65rem]", palette.value)}>
        {value}
      </p>
      <p className="mt-1.5 min-h-5 text-xs leading-5 text-slate-500 dark:text-slate-400">{note}</p>
    </>
  );
  const card = <article className={cardClassName}>{content}</article>;

  return to ? (
    <Link
      to={to}
      aria-label={`${label}: ${value}. ${note}`}
      className="group block rounded-2xl transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      {card}
    </Link>
  ) : onClick ? (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      aria-label={`${label}: ${value}. ${note}`}
      className="group block w-full cursor-pointer rounded-2xl text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      {card}
    </div>
  ) : card;
}
