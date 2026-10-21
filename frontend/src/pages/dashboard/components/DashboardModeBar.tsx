import { Building2, ChartNoAxesCombined, LayoutDashboard, UsersRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export type DashboardMode = "overview" | "hotels" | "revenue" | "team";

const modes = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "revenue", label: "Revenue", icon: ChartNoAxesCombined },
  { id: "team", label: "Team", icon: UsersRound },
] as const;

export default function DashboardModeBar({
  value,
  onChange,
}: {
  value: DashboardMode;
  onChange: (mode: DashboardMode) => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="tablist"
      aria-label="Dashboard views"
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-1.5"
    >
      {modes.map(({ id, label, icon: Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            id={`dashboard-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="dashboard-mode-panel"
            onClick={() => onChange(id)}
            className={`relative isolate inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:text-sm ${
              selected ? "text-brand-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {selected ? (
              <motion.span
                layoutId="dashboard-mode-pill"
                className="absolute inset-0 -z-10 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <Icon className={`size-4 ${selected ? "text-brand-600 dark:text-brand-300" : "text-slate-400"}`} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
