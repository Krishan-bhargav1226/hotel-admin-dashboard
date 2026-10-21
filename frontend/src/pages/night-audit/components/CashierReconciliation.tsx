import { CreditCard, IndianRupee, QrCode } from "lucide-react";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";

interface CashierReconciliationProps {
  cashTotal: number;
  upiTotal: number;
  cardTotal: number;
  estGst: number;
}

export function CashierReconciliation({
  cashTotal,
  upiTotal,
  cardTotal,
  estGst,
}: CashierReconciliationProps) {
  const totalSettled = cashTotal + upiTotal + cardTotal;

  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Front Desk Cashier & Tender Reconciliation
        </h3>
        <p className="text-xs text-slate-500">
          Reconcile physical cash drawer and electronic payments against PMS ledger totals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <PaymentCard
          icon={<IndianRupee className="size-4" />}
          label="Physical Cash Drawer"
          amount={cashTotal}
          theme="emerald"
        />
        <PaymentCard
          icon={<QrCode className="size-4" />}
          label="UPI & QR Settlements"
          amount={upiTotal}
          theme="blue"
        />
        <PaymentCard
          icon={<CreditCard className="size-4" />}
          label="Credit / Debit EDC POS"
          amount={cardTotal}
          theme="purple"
        />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Reconciled Collections
          </div>
          <div className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalSettled)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Includes {formatCurrency(estGst)} est. GST</p>
        </div>
      </div>
    </SectionBox>
  );
}

function PaymentCard({
  icon,
  label,
  amount,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  theme: "emerald" | "blue" | "purple";
}) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  }[theme];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2">
        <div className={`flex size-7 items-center justify-center rounded-lg ${styles}`}>{icon}</div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <div className="mt-2 font-mono text-lg font-bold text-slate-900 dark:text-white">
        {formatCurrency(amount)}
      </div>
    </div>
  );
}
