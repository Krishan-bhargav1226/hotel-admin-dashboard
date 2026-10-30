import { Copy, FileText, Printer, ReceiptText, UserCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../button";
import type { HotelSettings, Stay } from "../../../../utils/interfaces/Interface";

export type FolioView = "A4_INVOICE" | "THERMAL_SLIP" | "REG_CARD";
export type CopyType = "ORIGINAL" | "DUPLICATE";

interface FolioHeaderProps {
  stay: Stay;
  hotel: HotelSettings;
  invNumber: string;
  activeView: FolioView;
  setActiveView: (view: FolioView) => void;
  copyType: CopyType;
  setCopyType: (copy: CopyType) => void;
  onPrint: () => void;
  onClose: () => void;
}

export function FolioHeader({
  stay,
  hotel,
  invNumber,
  activeView,
  setActiveView,
  copyType,
  setCopyType,
  onPrint,
  onClose,
}: FolioHeaderProps) {
  const handleCopy = () => {
    navigator.clipboard?.writeText(invNumber);
    toast.success(`Copied Invoice No: ${invNumber}`);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
            <ReceiptText className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="folio-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Hotel Folio & Billing Terminal
              </h3>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {invNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy Invoice Number"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hotel.hotelName} · Room {stay.roomNumber} · {stay.guestName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={onPrint} className="gap-2 font-semibold">
            <Printer className="size-4" />
            <span>Print Document</span>
          </Button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-1.5">
          <TabButton
            active={activeView === "A4_INVOICE"}
            onClick={() => setActiveView("A4_INVOICE")}
            icon={<FileText className="size-3.5" />}
            label="A4 Luxury Tax Invoice"
          />
          <TabButton
            active={activeView === "THERMAL_SLIP"}
            onClick={() => setActiveView("THERMAL_SLIP")}
            icon={<ReceiptText className="size-3.5" />}
            label="80mm POS Slip"
          />
          <TabButton
            active={activeView === "REG_CARD"}
            onClick={() => setActiveView("REG_CARD")}
            icon={<UserCheck className="size-3.5" />}
            label="Check-in Reg Card"
          />
        </div>

        {activeView === "A4_INVOICE" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Copy:</span>
            <CopyBadge active={copyType === "ORIGINAL"} onClick={() => setCopyType("ORIGINAL")} label="Original (Guest)" />
            <CopyBadge active={copyType === "DUPLICATE"} onClick={() => setCopyType("DUPLICATE")} label="Duplicate (Hotel)" />
          </div>
        )}
      </div>
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "bg-white text-brand-800 shadow-xs ring-1 ring-slate-200 dark:bg-slate-800 dark:text-brand-300 dark:ring-slate-700"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CopyBadge({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 font-semibold ${
        active
          ? "bg-brand-100 text-brand-900 dark:bg-brand-950 dark:text-brand-200"
          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
