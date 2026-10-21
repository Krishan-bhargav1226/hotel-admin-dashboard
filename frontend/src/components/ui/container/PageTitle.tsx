import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

const PageTitle = ({ title, subtitle, actions }: Props) => {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5 sm:mb-7 sm:gap-6">
      <div className="min-w-0">
        <h1 className="text-[1.65rem] font-bold leading-tight tracking-[-0.045em] text-slate-900 text-balance dark:text-slate-50 sm:text-[1.9rem]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-600 dark:text-slate-400 sm:text-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div> : null}
    </div>
  );
};

export default PageTitle;
