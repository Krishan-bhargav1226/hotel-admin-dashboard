import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  MdAdd,
  MdDelete,
  MdReceiptLong,
  MdSearch,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import SectionBox from "../../components/ui/container/SectionBox";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import UiDialog from "../../components/ui/models/UiDialog";
import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpensesQuery,
} from "../../store/services/expense/expenseSlice";
import { formatCurrency, getErrorMessage } from "../../utils/helper/helper";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import type {
  ExpenseCategory,
  PaymentMode,
} from "../../utils/interfaces/Interface";

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; color: string }> = {
  GROCERY_KITCHEN: { label: "Grocery & Kitchen Supplies", color: "#10B981" },
  UTILITIES_ELECTRICITY: { label: "Electricity & Water Bills", color: "#6366F1" },
  LAUNDRY_SUPPLIES: { label: "Laundry & Detergents", color: "#0EA5E9" },
  MAINTENANCE_PARTS: { label: "Spares & Maintenance", color: "#F59E0B" },
  FUEL_GENERATOR: { label: "Generator Fuel / Diesel", color: "#EF4444" },
  STAFF_WELFARE: { label: "Staff Welfare & Meals", color: "#8B5CF6" },
  OTHER: { label: "Miscellaneous / Other", color: "#64748B" },
};

export default function Expenses() {
  const { data: expenses = [] } = useGetExpensesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "GROCERY_KITCHEN" as ExpenseCategory,
    amount: 1500,
    paymentMode: "UPI" as PaymentMode,
    date: dayjs().format("YYYY-MM-DD"),
    paidTo: "",
    notes: "",
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = filterCategory === "ALL" || e.category === filterCategory;
      const matchSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.paidTo && e.paidTo.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [expenses, filterCategory, searchQuery]);

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const todayExpenses = expenses
      .filter((e) => dayjs(e.date).isSame(dayjs(), "day"))
      .reduce((s, e) => s + e.amount, 0);
    const thisMonth = expenses
      .filter((e) => dayjs(e.date).isSame(dayjs(), "month"))
      .reduce((s, e) => s + e.amount, 0);

    // Group by category
    const catSums: Record<string, number> = {};
    expenses.forEach((e) => {
      catSums[e.category] = (catSums[e.category] || 0) + e.amount;
    });
    let topCat = "None";
    let maxAmt = 0;
    Object.entries(catSums).forEach(([c, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        topCat = CATEGORY_MAP[c as ExpenseCategory]?.label || c;
      }
    });

    return { total, todayExpenses, thisMonth, topCat };
  }, [expenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      toast.error("Please enter expense title and amount");
      return;
    }
    try {
      await createExpense({
        ...form,
        amount: Number(form.amount),
      }).unwrap();
      toast.success("Operational expense recorded");
      setOpenAddModal(false);
      setForm({
        title: "",
        category: "GROCERY_KITCHEN",
        amount: 1500,
        paymentMode: "UPI",
        date: dayjs().format("YYYY-MM-DD"),
        paidTo: "",
        notes: "",
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <MainContainer>
      <Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <PageTitle title={APP_TEXT.titles.EXPENSES} />
          <Typography variant="body2" className="text-gray-500">
            Record operational spending, fuel, groceries, and petty cash disbursements
          </Typography>
        </div>
        <UISubmitButton
          type="button"
          color="danger"
          text="Record Expense"
          startIcon={<MdAdd size={18} />}
          onClick={() => setOpenAddModal(true)}
        />
      </Box>

      {/* KPI Stats Ribbon */}
      <Box className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
        <SectionBox className="!p-3 border-l-4 border-l-rose-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Total Recorded Expenses</Typography>
          <Typography variant="h5" fontWeight={800} className="text-rose-600">{formatCurrency(stats.total)}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-amber-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Today's Expenses</Typography>
          <Typography variant="h5" fontWeight={800} className="text-amber-600">{formatCurrency(stats.todayExpenses)}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-indigo-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">This Month</Typography>
          <Typography variant="h5" fontWeight={800} className="text-indigo-900">{formatCurrency(stats.thisMonth)}</Typography>
        </SectionBox>
        <SectionBox className="!p-3 border-l-4 border-l-slate-500 bg-white shadow-sm">
          <Typography variant="caption" className="text-gray-500 font-semibold uppercase">Highest Spend Category</Typography>
          <Typography variant="subtitle1" fontWeight={800} className="text-slate-800 truncate" title={stats.topCat}>
            {stats.topCat}
          </Typography>
        </SectionBox>
      </Box>

      {/* Expenses Table */}
      <SectionBox className="bg-white shadow-sm rounded-xl">
        <Box className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 border-b pb-3">
          <Box className="flex items-center gap-2 flex-wrap">
            <Chip
              label="All Categories"
              clickable
              color={filterCategory === "ALL" ? "primary" : "default"}
              variant={filterCategory === "ALL" ? "filled" : "outlined"}
              onClick={() => setFilterCategory("ALL")}
              sx={{ fontWeight: 600, fontSize: "0.8rem" }}
            />
            {Object.entries(CATEGORY_MAP).map(([k, v]) => (
              <Chip
                key={k}
                label={v.label.split(" ")[0]}
                clickable
                color={filterCategory === k ? "primary" : "default"}
                variant={filterCategory === k ? "filled" : "outlined"}
                onClick={() => setFilterCategory(k)}
                sx={{ fontWeight: 600, fontSize: "0.8rem" }}
              />
            ))}
          </Box>

          <Box className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 w-full sm:w-64">
            <MdSearch className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search vendor or item..."
              className="bg-transparent text-sm outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
        </Box>

        {filteredExpenses.length === 0 ? (
          <Box className="py-12 text-center text-gray-400">
            <MdReceiptLong size={48} className="mx-auto mb-2 opacity-40" />
            <Typography variant="body1" fontWeight={600}>No expenses recorded</Typography>
            <Typography variant="caption">Log hotel petty cash or vendor bills</Typography>
          </Box>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-bold uppercase text-gray-500">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Title / Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Paid To / Vendor</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((exp) => {
                  const cat = CATEGORY_MAP[exp.category] || { label: exp.category, color: "#666" };
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-gray-600 font-medium">
                        {dayjs(exp.date).format("DD MMM YYYY")}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{exp.title}</div>
                        {exp.notes && <div className="text-xs text-gray-400 italic">{exp.notes}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700 font-medium">
                        {exp.paidTo || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <Chip size="small" label={exp.paymentMode} variant="outlined" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                      </td>
                      <td className="py-3 px-3 font-black text-rose-600 text-base">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            if (confirm(`Delete expense "${exp.title}"?`)) {
                              await deleteExpense(exp.id);
                              toast.success("Expense deleted");
                            }
                          }}
                          sx={{ minWidth: "auto", p: 0.5 }}
                        >
                          <MdDelete size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionBox>

      {/* RECORD EXPENSE MODAL */}
      <UiDialog open={openAddModal} onClose={() => setOpenAddModal(false)} title="Record Operational Expense" maxWidth="xs">
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <TextField
            label="Expense Title *"
            required
            fullWidth
            size="small"
            placeholder="e.g. Generator Diesel refill / Fresh vegetables"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={form.category}
              label="Category"
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            >
              {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Amount (₹) *"
              type="number"
              required
              fullWidth
              size="small"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={form.paymentMode}
                label="Payment Mode"
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value as PaymentMode })}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CARD">Card / NetBanking</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Date"
              type="date"
              fullWidth
              size="small"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Paid To / Vendor"
              fullWidth
              size="small"
              placeholder="Vendor Name"
              value={form.paidTo}
              onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
            />
          </div>

          <TextField
            label="Notes / Bill Voucher No"
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="Invoice number or remarks"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <DialogActions className="!px-0 !pt-2">
            <Button onClick={() => setOpenAddModal(false)} color="inherit">Cancel</Button>
            <UISubmitButton type="submit" color="danger" text="Save Expense" loading={isCreating} />
          </DialogActions>
        </form>
      </UiDialog>
    </MainContainer>
  );
}
