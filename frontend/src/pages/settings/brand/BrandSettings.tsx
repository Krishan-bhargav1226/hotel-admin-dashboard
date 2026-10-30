import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Palette, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../../store/services/settings/settingsSlice";
import type { HotelSettings } from "../../../utils/interfaces/Interface";
import { BrandHierarchyFields } from "./components/BrandHierarchyFields";
import { TaxComplianceFields } from "./components/TaxComplianceFields";
import { SettlementFields } from "./components/SettlementFields";
import { LiveFolioPreviewCard } from "./components/LiveFolioPreviewCard";

import { FeatureTogglesCard } from "./components/FeatureTogglesCard";

export default function BrandSettings() {
  const { data: settings } = useGetSettingsQuery();
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();

  const [form, setForm] = useState<Partial<HotelSettings>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm(settings);
    setReady(true);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: keyof HotelSettings, value: boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !ready) return;

    try {
      await updateSettings({
        ...settings,
        ...form,
        taxPercent: Number(form.taxPercent),
      } as HotelSettings).unwrap();
      toast.success("Hotel chain branding & folio parameters saved successfully!");
    } catch {
      toast.error("Failed to update branding settings");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <Palette className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Brand Identity & Folio Template Engine
            </h3>
            <p className="text-xs text-slate-500">
              Configure luxury brand hierarchy, GST tax schedules, and invoice print design.
            </p>
          </div>
        </div>
        <Button variant="default" size="sm" type="submit" loading={isLoading} disabled={!ready} className="gap-2 font-semibold">
          <Save className="size-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FeatureTogglesCard form={form} onChange={handleToggle} />
          <BrandHierarchyFields form={form} onChange={handleChange} />
          <TaxComplianceFields form={form} onChange={handleChange} />
          <SettlementFields form={form} onChange={handleChange} />
        </div>
        <div>
          <LiveFolioPreviewCard form={form} />
        </div>
      </div>
    </form>
  );
}
