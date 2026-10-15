import ExpenseSummaryCards from "./ExpenseSummaryCards";
import CashFlowChart from "./CashFlowChart";
import ExpenseCategoryChart from "./ExpenseCategoryChart";
import PaymentVendorCharts from "./PaymentVendorCharts";

export type ExpenseTimeRange = "7D" | "14D" | "30D" | "ALL";
export interface ExpenseStats { totalOutflow: number; rangeInflow: number; netOperatingCash: number; physicalCashInHand: number; todayExpenses: number; allCashInflow: number; allCashOutflow: number; }
export interface CashFlowPoint { date: string; displayDate: string; Inflow: number; Outflow: number; Net: number; }
export interface CategoryPoint { key: string; name: string; fullLabel: string; value: number; color: string; percentage: number; }
export interface PaymentModePoint { mode: string; Collections: number; Expenses: number; }
export interface VendorPoint { name: string; amount: number; }
export interface ExpenseDashboardProps {
  timeRange: ExpenseTimeRange;
  stats: ExpenseStats;
  dailyCashFlowData: CashFlowPoint[];
  categoryData: CategoryPoint[];
  paymentModeData: PaymentModePoint[];
  topVendorsData: VendorPoint[];
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}

export default function ExpenseDashboard({ timeRange, stats, dailyCashFlowData, categoryData, paymentModeData, topVendorsData, filterCategory, setFilterCategory }: ExpenseDashboardProps) {
  return <>
    <ExpenseSummaryCards timeRange={timeRange} stats={stats} />
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <CashFlowChart data={dailyCashFlowData} />
      <ExpenseCategoryChart data={categoryData} total={stats.totalOutflow} selected={filterCategory} onSelect={setFilterCategory} />
    </div>
    <PaymentVendorCharts payments={paymentModeData} vendors={topVendorsData} />
  </>;
}
