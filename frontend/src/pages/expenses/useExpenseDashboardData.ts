import { useMemo } from "react";
import dayjs from "dayjs";
import type { HotelExpense, Stay } from "../../utils/interfaces/Interface";
import { CATEGORY_MAP } from "./expenseConfig";
import type { CashFlowPoint, CategoryPoint, ExpenseStats, ExpenseTimeRange, PaymentModePoint, VendorPoint } from "./components/ExpenseDashboard";

interface Collection { date: string; amount: number; mode: string; }
interface ExpenseDashboardData {
  rangeExpenses: HotelExpense[];
  stats: ExpenseStats;
  dailyCashFlowData: CashFlowPoint[];
  categoryData: CategoryPoint[];
  paymentModeData: PaymentModePoint[];
  topVendorsData: VendorPoint[];
}

export default function useExpenseDashboardData(expenses: HotelExpense[], stays: Stay[], timeRange: ExpenseTimeRange): ExpenseDashboardData {
  const cutoffDate = useMemo(() => {
    if (timeRange === "7D") return dayjs().subtract(7, "day");
    if (timeRange === "14D") return dayjs().subtract(14, "day");
    if (timeRange === "30D") return dayjs().subtract(30, "day");
    return null;
  }, [timeRange]);

  const rangeExpenses = useMemo(() => !cutoffDate ? expenses : expenses.filter((expense) => dayjs(expense.date).isAfter(cutoffDate.subtract(1, "day"))), [expenses, cutoffDate]);
  const stayCollections = useMemo<Collection[]>(() => {
    const collections: Collection[] = [];
    stays.forEach((stay) => {
      const checkInDate = dayjs(stay.checkInAt).format("YYYY-MM-DD");
      if (stay.advanceAmount > 0) collections.push({ date: checkInDate, amount: stay.advanceAmount, mode: stay.advanceMode || "CASH" });
      if (stay.status === "COMPLETED" && stay.checkOutAt) {
        const settlement = Math.max(0, stay.totalAmount - stay.advanceAmount);
        if (settlement > 0) collections.push({ date: dayjs(stay.checkOutAt).format("YYYY-MM-DD"), amount: settlement, mode: stay.advanceMode || "UPI" });
      }
    });
    return collections;
  }, [stays]);

  const stats = useMemo<ExpenseStats>(() => {
    const totalOutflow = rangeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const inRange = stayCollections.filter((collection) => !cutoffDate || dayjs(collection.date).isAfter(cutoffDate.subtract(1, "day")));
    const rangeInflow = inRange.reduce((sum, collection) => sum + collection.amount, 0);
    const allCashInflow = stayCollections.filter((collection) => collection.mode === "CASH").reduce((sum, collection) => sum + collection.amount, 0);
    const allCashOutflow = expenses.filter((expense) => expense.paymentMode === "CASH").reduce((sum, expense) => sum + expense.amount, 0);
    const todayExpenses = expenses.filter((expense) => dayjs(expense.date).isSame(dayjs(), "day")).reduce((sum, expense) => sum + expense.amount, 0);
    return { totalOutflow, rangeInflow, netOperatingCash: rangeInflow - totalOutflow, physicalCashInHand: 5000 + allCashInflow - allCashOutflow, todayExpenses, allCashInflow, allCashOutflow };
  }, [rangeExpenses, expenses, stayCollections, cutoffDate]);

  const dailyCashFlowData = useMemo(() => {
    const daysCount = timeRange === "7D" ? 7 : timeRange === "14D" ? 14 : timeRange === "30D" ? 30 : 15;
    return Array.from({ length: daysCount }, (_, index) => {
      const date = dayjs().subtract(daysCount - 1 - index, "day");
      const key = date.format("YYYY-MM-DD");
      const inflow = stayCollections.filter((collection) => collection.date === key).reduce((sum, collection) => sum + collection.amount, 0);
      const outflow = expenses.filter((expense) => expense.date === key).reduce((sum, expense) => sum + expense.amount, 0);
      return { date: key, displayDate: date.format("DD MMM"), Inflow: inflow, Outflow: outflow, Net: inflow - outflow };
    });
  }, [timeRange, stayCollections, expenses]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    rangeExpenses.forEach((expense) => { totals[expense.category] = (totals[expense.category] || 0) + expense.amount; });
    const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(CATEGORY_MAP).map(([key, config]) => {
      const value = totals[key] || 0;
      return { key, name: config.short, fullLabel: config.label, value, color: config.color, percentage: Math.round((value / total) * 100) };
    }).filter((category) => category.value > 0);
  }, [rangeExpenses]);

  const paymentModeData = useMemo(() => (["CASH", "UPI", "CARD"].map((mode) => ({
    mode: mode === "CASH" ? "Cash (Drawer)" : mode === "UPI" ? "UPI (QR/Bank)" : "Card / POS",
    Collections: stayCollections.filter((collection) => (!cutoffDate || dayjs(collection.date).isAfter(cutoffDate.subtract(1, "day"))) && collection.mode === mode).reduce((sum, collection) => sum + collection.amount, 0),
    Expenses: rangeExpenses.filter((expense) => expense.paymentMode === mode).reduce((sum, expense) => sum + expense.amount, 0),
  }))), [rangeExpenses, stayCollections, cutoffDate]);

  const topVendorsData = useMemo(() => {
    const totals: Record<string, number> = {};
    rangeExpenses.forEach((expense) => { const vendor = expense.paidTo?.trim() || "Miscellaneous"; totals[vendor] = (totals[vendor] || 0) + expense.amount; });
    return Object.entries(totals).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [rangeExpenses]);

  return { rangeExpenses, stats, dailyCashFlowData, categoryData, paymentModeData, topVendorsData };
}
