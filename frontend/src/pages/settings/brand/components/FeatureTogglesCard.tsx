import { Moon, Sparkles, Tag } from "lucide-react";
import SectionBox from "../../../../components/ui/container/SectionBox";
import type { HotelSettings } from "../../../../utils/interfaces/Interface";

interface FeatureTogglesCardProps {
  form: Partial<HotelSettings>;
  onChange: (name: keyof HotelSettings, value: boolean) => void;
}

export function FeatureTogglesCard({ form, onChange }: FeatureTogglesCardProps) {
  const isNightAuditEnabled = form.enableNightAudit !== false;
  const isAutoCleaning = form.autoCleaning !== false;
  const isLostFoundEnabled = form.enableLostAndFound !== false;

  return (
    <SectionBox>
      <div className="mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Operational Module Feature Toggles
        </h4>
        <p className="text-xs text-slate-500">
          Turn specialized hotel chain workflows on or off based on operational complexity.
        </p>
      </div>

      <div className="space-y-3 text-xs">
        {/* Night Audit / EOD Toggle */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <Moon className="size-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Night Audit (EOD) Operations</div>
              <p className="text-[11px] text-slate-500">
                End-of-day revenue closing, automated folio tariff posting, and cashier tender reconciliation.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isNightAuditEnabled}
            onClick={() => onChange("enableNightAudit", !isNightAuditEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isNightAuditEnabled ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isNightAuditEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Auto Cleaning Toggle */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Auto Housekeeping Dispatch</div>
              <p className="text-[11px] text-slate-500">
                Automatically transition vacant rooms to "Cleaning" state immediately upon guest checkout.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isAutoCleaning}
            onClick={() => onChange("autoCleaning", !isAutoCleaning)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAutoCleaning ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isAutoCleaning ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Lost & Found Toggle */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <Tag className="size-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Lost & Found Custody Registry</div>
              <p className="text-[11px] text-slate-500">
                Maintain chain-of-custody for articles found in rooms with printable locker tags.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isLostFoundEnabled}
            onClick={() => onChange("enableLostAndFound", !isLostFoundEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isLostFoundEnabled ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isLostFoundEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </SectionBox>
  );
}
