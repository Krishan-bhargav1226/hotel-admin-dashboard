import SectionBox from "../../../../components/ui/container/SectionBox";
import type { HotelSettings } from "../../../../utils/interfaces/Interface";

interface TaxComplianceFieldsProps {
  form: Partial<HotelSettings>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TaxComplianceFields({ form, onChange }: TaxComplianceFieldsProps) {
  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">GST Compliance & SAC Codes</h4>
        <p className="text-xs text-slate-500">Statutory tax credentials printed on legal Tax Invoices.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Registered GSTIN *</label>
          <input
            type="text"
            name="gstin"
            value={form.gstin || ""}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono font-bold dark:border-slate-700 dark:bg-slate-900"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">State Code</label>
          <input
            type="text"
            name="stateCode"
            value={form.stateCode || ""}
            onChange={onChange}
            placeholder="e.g. 08 - Rajasthan"
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Corporate CIN</label>
          <input
            type="text"
            name="cin"
            value={form.cin || ""}
            onChange={onChange}
            placeholder="e.g. U55101RJ2018PLC048291"
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">FSSAI Food License #</label>
          <input
            type="text"
            name="fssai"
            value={form.fssai || ""}
            onChange={onChange}
            placeholder="e.g. 10019011000543"
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Room SAC Code</label>
          <input
            type="text"
            name="sacCodeAccommodation"
            value={form.sacCodeAccommodation || "996311"}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">F&B / Restaurant SAC</label>
          <input
            type="text"
            name="sacCodeFood"
            value={form.sacCodeFood || "996331"}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>
    </SectionBox>
  );
}
