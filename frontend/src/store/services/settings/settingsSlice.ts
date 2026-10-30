import { hotelApi } from "../baseQuery";
import type { HotelSettings } from "../../../utils/interfaces/Interface";

const finite = (value: unknown, fallback: number) => {
  if (value == null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clip = (value: unknown, max: number) => {
  if (value == null) return "";
  const text = String(value).trim();
  return text.length > max ? text.slice(0, max) : text;
};

const optional = (value: unknown, max: number) => {
  const text = clip(value, max);
  return text.length > 0 ? text : null;
};

const flag = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

const mapSettings = (res: any): HotelSettings => {
  const item = res && typeof res === "object" && "hotelName" in res ? res : (res?.data ?? res ?? {});
  const taxPercent = finite(item.taxPercent, 12);
  return {
    hotelName: clip(item.hotelName, 150),
    chainName: clip(item.chainName, 150),
    brandTier: clip(item.brandTier, 50),
    tagline: clip(item.tagline, 200),
    address: clip(item.address, 300),
    city: clip(item.city, 100),
    stateCode: clip(item.stateCode, 20),
    phone: clip(item.phone, 20),
    email: clip(item.email, 150),
    website: clip(item.website, 150),
    gstin: clip(item.gstin, 20),
    cin: clip(item.cin, 30),
    fssai: clip(item.fssai, 20),
    upiId: clip(item.upiId, 100),
    taxPercent,
    cgstPercent: finite(item.cgstPercent, taxPercent / 2),
    sgstPercent: finite(item.sgstPercent, taxPercent / 2),
    sacCodeAccommodation: clip(item.sacCodeAccommodation, 20),
    sacCodeFood: clip(item.sacCodeFood, 20),
    invoicePrefix: clip(item.invoicePrefix, 20),
    bankName: clip(item.bankName, 100),
    bankAccountNo: clip(item.bankAccountNo, 40),
    bankIfsc: clip(item.bankIfsc, 20),
    folioPolicy: clip(item.folioPolicy, 500),
    autoCleaning: flag(item.autoCleaning, true),
    currencySymbol: clip(item.currencySymbol, 10) || "₹",
    checkInTime: clip(item.checkInTime, 10),
    checkOutTime: clip(item.checkOutTime, 10),
    managerSignatory: clip(item.managerSignatory, 100),
    logoUrl: item.logoUrl ? String(item.logoUrl) : undefined,
    enableNightAudit: flag(item.enableNightAudit, true),
    enableLostAndFound: flag(item.enableLostAndFound, true),
  };
};

const settingsBody = (data: HotelSettings) => {
  const taxPercent = finite(data.taxPercent, 12);
  return {
    hotelName: clip(data.hotelName, 150),
    chainName: optional(data.chainName, 150),
    brandTier: optional(data.brandTier, 50),
    tagline: optional(data.tagline, 200),
    address: optional(data.address, 300),
    city: optional(data.city, 100),
    stateCode: optional(data.stateCode, 20),
    phone: optional(data.phone, 20),
    email: optional(data.email, 150),
    website: optional(data.website, 150),
    gstin: optional(data.gstin, 20),
    cin: optional(data.cin, 30),
    fssai: optional(data.fssai, 20),
    upiId: optional(data.upiId, 100),
    taxPercent,
    cgstPercent: finite(data.cgstPercent, taxPercent / 2),
    sgstPercent: finite(data.sgstPercent, taxPercent / 2),
    sacCodeAccommodation: optional(data.sacCodeAccommodation, 20),
    sacCodeFood: optional(data.sacCodeFood, 20),
    invoicePrefix: optional(data.invoicePrefix, 20),
    bankName: optional(data.bankName, 100),
    bankAccountNo: optional(data.bankAccountNo, 40),
    bankIfsc: optional(data.bankIfsc, 20),
    folioPolicy: optional(data.folioPolicy, 500),
    autoCleaning: flag(data.autoCleaning, true),
    currencySymbol: clip(data.currencySymbol, 10) || "₹",
    checkInTime: optional(data.checkInTime, 10),
    checkOutTime: optional(data.checkOutTime, 10),
    managerSignatory: optional(data.managerSignatory, 100),
    logoUrl: data.logoUrl || null,
    enableNightAudit: flag(data.enableNightAudit, true),
    enableLostAndFound: flag(data.enableLostAndFound, true),
  };
};

const settingsApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<HotelSettings, void>({
      query: () => "/settings",
      transformResponse: (res: any) => mapSettings(res),
      providesTags: ["Settings"],
    }),

    updateSettings: builder.mutation<HotelSettings, HotelSettings>({
      query: (data) => ({
        url: "/settings",
        method: "PUT",
        body: settingsBody(data),
      }),
      transformResponse: (res: any) => mapSettings(res),
      invalidatesTags: ["Settings", "Property"],
    }),

    exportBackup: builder.mutation<Record<string, unknown>, void>({
      query: () => "/report/summary",
      transformResponse: (res: unknown) => {
        if (res && typeof res === "object" && "data" in res) {
          const data = (res as { data?: unknown }).data;
          return data && typeof data === "object" ? data as Record<string, unknown> : {};
        }
        return res && typeof res === "object" ? res as Record<string, unknown> : {};
      },
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useExportBackupMutation,
} = settingsApi;

export default settingsApi;
