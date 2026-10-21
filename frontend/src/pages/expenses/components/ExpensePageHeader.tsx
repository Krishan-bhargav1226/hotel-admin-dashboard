import { Plus } from "lucide-react";
import PageTitle from "../../../components/ui/container/PageTitle";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import type { ExpenseTimeRange } from "./ExpenseDashboard";

const RANGES: { value: ExpenseTimeRange; label: string }[] = [
  { value: "7D", label: "7 Days" }, { value: "14D", label: "14 Days" }, { value: "30D", label: "30 Days" }, { value: "ALL", label: "All Time" },
];

export default function ExpensePageHeader({ range, onRangeChange, onAddExpense }: { range: ExpenseTimeRange; onRangeChange: (range: ExpenseTimeRange) => void; onAddExpense: () => void }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <PageTitle title="Operational expenses" subtitle="Operational cash-flow, department expenditures, petty cash, and daily drawer reconciliation." />
    <div className="flex flex-wrap items-center gap-2.5"><div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">{RANGES.map((item) => <button key={item.value} type="button" onClick={() => onRangeChange(item.value)} className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-bold transition-all ${range === item.value ? "bg-white text-brand-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}>{item.label}</button>)}</div><UISubmitButton type="button" color="danger" text="Record Expense" startIcon={<Plus size={18} />} onClick={onAddExpense} /></div>
  </div>;
}
