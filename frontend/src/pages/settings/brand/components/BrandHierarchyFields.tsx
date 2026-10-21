import SectionBox from "../../../../components/ui/container/SectionBox";
import type { HotelSettings } from "../../../../utils/interfaces/Interface";

interface BrandHierarchyFieldsProps {
  form: Partial<HotelSettings>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BrandHierarchyFields({ form, onChange }: BrandHierarchyFieldsProps) {
  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Hotel Chain & Brand Tier</h4>
        <p className="text-xs text-slate-500">Corporate brand name, star tier classification, and marketing tagline.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Hotel Chain Brand Name</label>
          <input
            type="text"
            name="chainName"
            value={form.chainName || ""}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Brand Classification / Star Tier</label>
          <input
            type="text"
            name="brandTier"
            value={form.brandTier || ""}
            onChange={onChange}
            placeholder="e.g. ★★★★★ Signature Luxury Heritage"
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold text-amber-700 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Property Sub-Name</label>
          <input
            type="text"
            name="hotelName"
            value={form.hotelName || ""}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold text-brand-900 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300">Brand Tagline</label>
          <input
            type="text"
            name="tagline"
            value={form.tagline || ""}
            onChange={onChange}
            className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 italic dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>
    </SectionBox>
  );
}
