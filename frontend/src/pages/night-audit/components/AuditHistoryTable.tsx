import { Moon, Printer } from "lucide-react";
import SectionBox from "../../../components/ui/container/SectionBox";
import { Button } from "../../../components/ui/button";
import { formatCurrency } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import type { NightAuditRecord } from "../../../utils/interfaces/Interface";

interface AuditHistoryTableProps {
  audits: NightAuditRecord[];
  onPrintReport: (audit: NightAuditRecord) => void;
}

export function AuditHistoryTable({ audits, onPrintReport }: AuditHistoryTableProps) {
  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Historical Night Audit Log & Flash Archive
        </h3>
        <p className="text-xs text-slate-500">
          Permanent audit trail with daily ADR, RevPAR, and revenue reconciliations.
        </p>
      </div>

      {audits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
          <Moon className="mb-2 size-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium">No previous night audit cycles logged yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <th className="pb-2">Business Date</th>
                <th className="pb-2">Audit Timestamp</th>
                <th className="pb-2">Audited By</th>
                <th className="pb-2 text-right">Occupancy</th>
                <th className="pb-2 text-right">Room Rev</th>
                <th className="pb-2 text-right">Gross Rev</th>
                <th className="pb-2 text-right">ADR</th>
                <th className="pb-2 text-right">RevPAR</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                  <td className="py-2.5 font-mono font-bold text-brand-800 dark:text-brand-300">
                    {a.businessDate}
                  </td>
                  <td className="py-2.5 text-slate-500">{formatDateTime(a.auditTimestamp)}</td>
                  <td className="py-2.5 font-medium">{a.auditedBy}</td>
                  <td className="py-2.5 text-right font-mono font-bold">{a.occupancyRate}%</td>
                  <td className="py-2.5 text-right font-mono">{formatCurrency(a.roomRevenue)}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(a.totalRevenue)}
                  </td>
                  <td className="py-2.5 text-right font-mono">{formatCurrency(a.adr)}</td>
                  <td className="py-2.5 text-right font-mono">{formatCurrency(a.revPar)}</td>
                  <td className="py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPrintReport(a)}
                      className="h-7 gap-1 px-2 text-[11px]"
                    >
                      <Printer className="size-3.5" />
                      <span>Flash Report</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionBox>
  );
}
