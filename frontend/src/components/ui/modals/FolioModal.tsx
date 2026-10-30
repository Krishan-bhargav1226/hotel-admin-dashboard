import { useState } from "react";
import { Printer } from "lucide-react";
import {
  generateLuxuryInvoiceHtml,
  generateRegCardHtml,
  generateThermalReceiptHtml,
  openPrintWindow,
} from "../../print/printPdf/BillPrintService";
import { Button } from "../button";
import { formatCurrency } from "../../../utils/helper/helper";
import type { HotelSettings, Stay } from "../../../utils/interfaces/Interface";
import { FolioHeader, type CopyType, type FolioView } from "./folio/FolioHeader";
import { FolioInvoicePreview } from "./folio/FolioInvoicePreview";
import { FolioThermalPreview } from "./folio/FolioThermalPreview";
import { FolioRegCardPreview } from "./folio/FolioRegCardPreview";

interface FolioModalProps {
  open: boolean;
  onClose: () => void;
  stay: Stay | null;
  hotel: HotelSettings | null;
}

export default function FolioModal({ open, onClose, stay, hotel }: FolioModalProps) {
  const [activeView, setActiveView] = useState<FolioView>("A4_INVOICE");
  const [copyType, setCopyType] = useState<CopyType>("ORIGINAL");

  if (!open || !stay || !hotel) return null;

  const invNumber = `${hotel.invoicePrefix || "GH-INV/2026/"}${stay.stayNo.replace(/\D/g, "") || "0482"}`;
  const totalPaid = stay.paidAmount || stay.advanceAmount || 0;
  const balanceDue = stay.dueAmount || Math.max(0, stay.totalAmount - totalPaid);

  const handlePrint = () => {
    let html = "";
    if (activeView === "A4_INVOICE") {
      html = generateLuxuryInvoiceHtml({ stay, hotel, copyType, invoiceNo: invNumber });
    } else if (activeView === "THERMAL_SLIP") {
      html = generateThermalReceiptHtml({ stay, hotel, invoiceNo: invNumber });
    } else {
      html = generateRegCardHtml(stay, hotel);
    }
    openPrintWindow(html);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="folio-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/70 p-3 sm:p-5 backdrop-blur-xs"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <FolioHeader
          stay={stay}
          hotel={hotel}
          invNumber={invNumber}
          activeView={activeView}
          setActiveView={setActiveView}
          copyType={copyType}
          setCopyType={setCopyType}
          onPrint={handlePrint}
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeView === "A4_INVOICE" && (
            <FolioInvoicePreview stay={stay} hotel={hotel} invNumber={invNumber} copyType={copyType} />
          )}
          {activeView === "THERMAL_SLIP" && (
            <FolioThermalPreview stay={stay} hotel={hotel} invNumber={invNumber} />
          )}
          {activeView === "REG_CARD" && <FolioRegCardPreview stay={stay} hotel={hotel} />}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>
              Total: <strong className="font-mono text-slate-900 dark:text-white">{formatCurrency(stay.totalAmount)}</strong>
            </span>
            <span>
              Paid: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(totalPaid)}</strong>
            </span>
            {balanceDue > 0 && (
              <span>
                Due: <strong className="font-mono text-rose-600">{formatCurrency(balanceDue)}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="default" size="sm" onClick={handlePrint} className="gap-1.5 font-semibold">
              <Printer className="size-4" />
              <span>
                Print {activeView === "A4_INVOICE" ? "Tax Invoice (A4)" : activeView === "THERMAL_SLIP" ? "Thermal Slip" : "Reg Card"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
