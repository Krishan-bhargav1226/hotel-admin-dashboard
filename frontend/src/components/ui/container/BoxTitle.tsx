import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import FormTitle from "./FormTitle";

const BoxTitle = ({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) => {
  return (
    <section className={cn("rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-panel", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <FormTitle title={title} />
        </div>
        {action}
      </div>
      {children}
    </section>
  );
};

export default BoxTitle;
