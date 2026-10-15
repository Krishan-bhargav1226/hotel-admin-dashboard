import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import MainContainer from "../../components/ui/container/MainContainer";
import ExpenseDialog, { type ExpenseFormValues } from "./components/ExpenseDialog";
import ExpenseDashboard, { type ExpenseTimeRange } from "./components/ExpenseDashboard";
import ExpenseLedger from "./components/ExpenseLedger";
import ExpensePageHeader from "./components/ExpensePageHeader";
import useExpenseDashboardData from "./useExpenseDashboardData";
import { CATEGORY_MAP } from "./expenseConfig";
import { useCreateExpenseMutation, useDeleteExpenseMutation, useGetExpensesQuery } from "../../store/services/expense/expenseSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { getErrorMessage } from "../../utils/helper/helper";
import type { ExpenseCategory, HotelExpense, PaymentMode } from "../../utils/interfaces/Interface";

const createEmptyForm = (): ExpenseFormValues => ({ title: "", category: "GROCERY_KITCHEN", amount: 1500, paymentMode: "UPI", date: dayjs().format("YYYY-MM-DD"), paidTo: "", notes: "" });

export default function Expenses() {
  const { data: expenses = [] } = useGetExpensesQuery();
  const { data: stays = [] } = useGetStaysQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [timeRange, setTimeRange] = useState<ExpenseTimeRange>("14D");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState<ExpenseFormValues>(createEmptyForm);
  const { rangeExpenses, stats, dailyCashFlowData, categoryData, paymentModeData, topVendorsData } = useExpenseDashboardData(expenses, stays, timeRange);

  const filteredExpenses = useMemo(() => rangeExpenses.filter((expense) => {
    const matchesCategory = filterCategory === "ALL" || expense.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = expense.title.toLowerCase().includes(query) || (expense.paidTo && expense.paidTo.toLowerCase().includes(query)) || (expense.notes && expense.notes.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  }), [rangeExpenses, filterCategory, searchQuery]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.amount) return toast.error("Please enter expense title and amount");
    try {
      await createExpense({ ...form, amount: Number(form.amount), category: form.category as ExpenseCategory, paymentMode: form.paymentMode as PaymentMode }).unwrap();
      toast.success("Operational expense recorded");
      setOpenAddModal(false);
      setForm(createEmptyForm());
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleDeleteExpense = async (expense: HotelExpense) => {
    if (!confirm(`Delete expense "${expense.title}"?`)) return;
    await deleteExpense(expense.id);
    toast.success("Expense deleted");
  };

  return <MainContainer>
    <ExpensePageHeader range={timeRange} onRangeChange={setTimeRange} onAddExpense={() => setOpenAddModal(true)} />
    <ExpenseDashboard timeRange={timeRange} stats={stats} dailyCashFlowData={dailyCashFlowData} categoryData={categoryData} paymentModeData={paymentModeData} topVendorsData={topVendorsData} filterCategory={filterCategory} setFilterCategory={setFilterCategory} />
    <ExpenseLedger expensesCount={expenses.length} expenses={filteredExpenses} categoryMap={CATEGORY_MAP} filterCategory={filterCategory} setFilterCategory={setFilterCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onDelete={handleDeleteExpense} />
    <ExpenseDialog open={openAddModal} onClose={() => setOpenAddModal(false)} onSubmit={handleSubmit} form={form} setForm={setForm} categories={CATEGORY_MAP} isCreating={isCreating} />
  </MainContainer>;
}
