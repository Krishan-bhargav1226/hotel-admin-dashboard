import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SectionBox({ children, className = "", onClick }: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--foreground)] shadow-panel transition-all duration-200 sm:p-6",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card focus-within:ring-2 focus-within:ring-brand-500/20",
        className
      )}
      onClick={onClick}
    >
      {children}
    </section>
  );
}
