import { CheckCircle2 } from "lucide-react";
import type { HotelSettings } from "../../../../utils/interfaces/Interface";

interface LiveFolioPreviewCardProps {
  form: Partial<HotelSettings>;
}

export function LiveFolioPreviewCard({ form }: LiveFolioPreviewCardProps) {
  return (
    <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
          Live Folio Header Preview
        </span>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          ACTIVE
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
          {form.brandTier || "★★★★★ Signature Luxury Heritage"}
        </div>
        <h4 className="text-base font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
          {form.chainName || "GRAND HORIZON HOTELS & RESORTS"}
        </h4>
        <div className="text-xs font-bold text-brand-800 dark:text-brand-300">
          {form.hotelName || "Grand Horizon Palace & Spa"}
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-snug">
          {form.address || "Palace Road, Near City Palace, Jaipur, Rajasthan, 302002"}
          <br />
          GSTIN: <strong>{form.gstin || "08AAAAA0000A1Z5"}</strong> · State: {form.stateCode || "08 - Rajasthan"}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-[11px] font-mono dark:border-slate-800">
          <span className="text-slate-500">Invoice Sample:</span>
          <strong className="text-slate-900 dark:text-white">{form.invoicePrefix || "GH-INV/2026/"}0482</strong>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-500">SAC Code:</span>
          <span>{form.sacCodeAccommodation || "996311"}</span>
        </div>

        <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-2 text-center text-[10px] text-slate-500 dark:border-slate-700">
          UPI QR Enabled: <strong className="font-mono text-slate-800 dark:text-slate-200">{form.upiId || "hotel@upi"}</strong>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50/60 p-3 text-[11px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        <div className="flex items-center gap-1.5 font-bold">
          <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
          <span>GST Tax Invoice Compliant</span>
        </div>
        <p className="mt-1 text-[10px] text-blue-700 dark:text-blue-300">
          Populates printed A4 Tax Invoices, 80mm POS slips, and Check-in Registration Cards across the hotel chain.
        </p>
      </div>
    </div>
  );
}
