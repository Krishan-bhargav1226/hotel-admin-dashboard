import type { ReactNode } from "react";
import { TableLabelContext } from "./tableContext";

export interface TableColumn {
  label: string | ReactNode;
}

interface Props {
  columns: TableColumn[];
  children: ReactNode;
}

function columnText(label: ReactNode, index: number) {
  if (typeof label === "string" || typeof label === "number") return String(label);
  return `Column ${index + 1}`;
}

const RenderTable = ({ columns, children }: Props) => {
  const labels = columns.map((column, index) => columnText(column.label, index));

  return (
    <TableLabelContext.Provider value={labels}>
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-panel dark:border-slate-700 dark:bg-[var(--card)]">
        <div className="w-full md:overflow-x-auto">
          <table className="data-table w-full border-collapse text-left text-sm md:min-w-[720px]" aria-label="data table">
            <thead className="bg-slate-50/80 dark:bg-white/[0.03]">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-900 dark:text-slate-100">{children}</tbody>
          </table>
        </div>
      </div>
    </TableLabelContext.Provider>
  );
};

export default RenderTable;
