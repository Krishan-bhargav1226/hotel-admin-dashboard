import SectionBox from "../../../../components/ui/container/SectionBox";
import type { HotelSettings } from "../../../../utils/interfaces/Interface";

interface SettlementFieldsProps {
  form: Partial<HotelSettings>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function SettlementFields({ form, onChange }: SettlementFieldsProps) {
  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Folio Sequencing & Digital Payments</h4>
        <p className="text-xs text-slate-500">Invoice numbering prefix and bank wire settlement details.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Invoice Number Prefix</label>
          <input
            type="text"
            name="invoicePrefix"
            value={form.invoicePrefix || "GH-INV/2026/"}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">UPI VPA for Dynamic QR</label>
          <input
            type="text"
            name="upiId"
            value={form.upiId || ""}
            onChange={onChange}
            placeholder="e.g. grandhorizon@okaxis"
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Settlement Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={form.bankName || ""}
            onChange={onChange}
            placeholder="e.g. HDFC Bank Ltd"
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Bank Account Number</label>
          <input
            type="text"
            name="bankAccountNo"
            value={form.bankAccountNo || ""}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Bank IFSC Code</label>
          <input
            type="text"
            name="bankIfsc"
            value={form.bankIfsc || ""}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Authorized Signatory Stamp</label>
          <input
            type="text"
            name="managerSignatory"
            value={form.managerSignatory || ""}
            onChange={onChange}
            placeholder="e.g. Vikram Malhotra (General Manager)"
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Folio Terms of Stay & Disclaimer (Printed on Bill Footer)
          </label>
          <textarea
            name="folioPolicy"
            rows={3}
            value={form.folioPolicy || ""}
            onChange={onChange}
            className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>
    </SectionBox>
  );
}
