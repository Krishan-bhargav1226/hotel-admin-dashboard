import { Package, Printer, Trash2, UserCheck } from "lucide-react";
import SectionBox from "../../../components/ui/container/SectionBox";
import { Button } from "../../../components/ui/button";
import type { LostAndFoundItem } from "../../../utils/interfaces/Interface";
import { STATUS_LABELS } from "../lostFoundConstants";

interface LostFoundTableProps {
  items: LostAndFoundItem[];
  onPrintTag: (item: LostAndFoundItem) => void;
  onInitiateClaim: (item: LostAndFoundItem) => void;
  onDeleteItem: (id: string) => void;
}

export function LostFoundTable({
  items,
  onPrintTag,
  onInitiateClaim,
  onDeleteItem,
}: LostFoundTableProps) {
  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custody & Property Ledger</h3>
        <p className="text-xs text-slate-500">
          Traceable chain-of-custody register with printable locker labels.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
          <Package className="mb-2 size-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium">No lost & found articles found matching criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <th className="pb-2">Tag #</th>
                <th className="pb-2">Article / Description</th>
                <th className="pb-2">Location Found</th>
                <th className="pb-2">Logged Date</th>
                <th className="pb-2">Custody / Locker</th>
                <th className="pb-2">Associated Guest</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((it) => {
                const badge = STATUS_LABELS[it.status] || STATUS_LABELS.SECURED;
                return (
                  <tr key={it.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                    <td className="py-3 font-mono font-bold text-brand-800 dark:text-brand-300">{it.itemNo}</td>
                    <td className="py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{it.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {it.category} · Found by: {it.foundByStaff}
                      </div>
                    </td>
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-300">{it.locationFound}</td>
                    <td className="py-3 text-slate-500">
                      {it.foundDate} <span className="text-[10px]">{it.foundTime}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{it.storageLocker}</td>
                    <td className="py-3">
                      {it.guestName ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{it.guestName}</div>
                          <div className="font-mono text-[10px] text-slate-500">{it.guestPhone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unidentified Guest</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 font-semibold text-[11px] ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPrintTag(it)}
                          title="Print Luggage / Locker Tag"
                          className="h-7 w-7 p-0"
                        >
                          <Printer className="size-3.5 text-slate-600 dark:text-slate-300" />
                        </Button>
                        {it.status !== "CLAIMED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onInitiateClaim(it)}
                            title="Mark Handed Over / Claimed"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                          >
                            <UserCheck className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(it.id)}
                          title="Delete Record"
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionBox>
  );
}
