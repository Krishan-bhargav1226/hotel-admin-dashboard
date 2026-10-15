import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

const PageTitle = ({ title, subtitle, actions }: Props) => {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b border-[var(--border)] pb-5">
      <div>
        <h1 className="text-[1.8rem] font-bold leading-tight tracking-[-0.04em] text-slate-900 text-balance dark:text-slate-50">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export default PageTitle;
