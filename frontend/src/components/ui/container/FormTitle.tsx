interface Props {
  title: string;
  className?: string;
}

const FormTitle = ({ title, className = "" }: Props) => {
  return (
    <div className={`border-b border-[var(--border)] pb-3 ${className}`}>
      <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
    </div>
  );
};

export default FormTitle;
