import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import { MdDelete, MdReceiptLong, MdSearch } from "react-icons/md";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { ExpenseCategory, HotelExpense } from "../../../utils/interfaces/Interface";

interface ExpenseCategoryConfig { label: string; color: string; short: string; }
interface ExpenseLedgerProps {
  expensesCount: number;
  expenses: HotelExpense[];
  categoryMap: Record<ExpenseCategory, ExpenseCategoryConfig>;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onDelete: (expense: HotelExpense) => void;
}

export default function ExpenseLedger({ expensesCount, expenses, categoryMap, filterCategory, setFilterCategory, searchQuery, setSearchQuery, onDelete }: ExpenseLedgerProps) {
  const CATEGORY_MAP = categoryMap;
  const filteredExpenses = expenses;
  return (<SectionBox className="!p-5 bg-white shadow-card rounded-2xl border border-slate-200/90">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={filterCategory === "ALL"}
                onClick={() => setFilterCategory("ALL")}
                className={`min-h-10 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                  filterCategory === "ALL" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories ({expensesCount})
              </button>
              {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filterCategory === k}
                  onClick={() => setFilterCategory(k)}
                  className={`min-h-10 rounded-lg px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                    filterCategory === k ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {v.short}
                </button>
              ))}
            </div>

            <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:max-w-xs">
              <MdSearch className="text-slate-400" size={16} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search vendor, item or bill..."
                aria-label="Search expenses"
                className="w-full bg-transparent text-xs text-slate-900 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <Box className="py-12 text-center text-gray-400">
            <MdReceiptLong size={48} className="mx-auto mb-2 opacity-40" />
            <Typography variant="body1" fontWeight={600}>No expenses found</Typography>
            <Typography variant="caption">Try adjusting your filters or record a new expense voucher</Typography>
          </Box>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="md:overflow-x-auto">
              <table className="data-table w-full text-left text-sm md:min-w-[760px]">
                <thead className="bg-slate-50">
                  <tr className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Title / Purpose</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Vendor / Payee</th>
                    <th className="py-3 px-3">Payment Channel</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((exp) => {
                    const cat = CATEGORY_MAP[exp.category] || { label: exp.category, color: "#64748B", short: exp.category };
                    return (
                      <tr key={exp.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <td data-label="Date" className="px-3 py-3 font-medium text-xs text-slate-600 font-mono">
                          {dayjs(exp.date).format("DD MMM YYYY")}
                        </td>
                        <td data-label="Description" className="px-3 py-3">
                          <div className="font-bold text-xs text-slate-900">{exp.title}</div>
                          {exp.notes && <div className="text-[11px] text-gray-400 italic mt-0.5">{exp.notes}</div>}
                        </td>
                        <td data-label="Category" className="px-3 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            {cat.label}
                          </span>
                        </td>
                        <td data-label="Paid to" className="px-3 py-3 font-medium text-xs text-slate-700">
                          {exp.paidTo || "—"}
                        </td>
                        <td data-label="Mode" className="px-3 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            exp.paymentMode === "CASH"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : exp.paymentMode === "UPI"
                              ? "bg-brand-50 text-brand-700 border border-brand-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}>
                            {exp.paymentMode}
                          </span>
                        </td>
                        <td data-label="Amount" className="px-3 py-3 font-mono text-sm font-bold text-rose-600">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td data-label="Action" className="px-3 py-3 text-right">
                          <button
                            type="button"
                            aria-label={`Delete ${exp.title}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            onClick={() => onDelete(exp)}
                          >
                            <MdDelete size={16} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionBox>
  );
}

