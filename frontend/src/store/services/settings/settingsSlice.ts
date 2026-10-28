import { hotelApi } from "../baseQuery";
import type { HotelSettings } from "../../../utils/interfaces/Interface";

const settingsApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<HotelSettings, void>({
      query: () => "/settings",
      transformResponse: (res: any): HotelSettings => {
        const item = res?.data ?? res;
        return {
          hotelName: item?.hotelName || "Grand Horizon Palace & Spa",
          chainName: item?.chainName || "Grand Horizon Hotels & Resorts",
          brandTier: item?.brandTier || "Palace",
          tagline: item?.tagline || "Heritage Luxury, Redefined",
          address: item?.address || "Amer Road, Civil Lines, Jaipur, Rajasthan 302006",
          city: item?.city || "Jaipur",
          stateCode: item?.stateCode || "08 - Rajasthan",
          phone: item?.phone || "0141-4567890",
          email: item?.email || "jaipur@grandhorizon.local",
          website: item?.website || "https://grandhorizonhotels.com",
          gstin: item?.gstin || "08AABCG1234P1Z5",
          cin: item?.cin || "U55101RJ2018PLC048291",
          fssai: item?.fssai || "10019011000543",
          upiId: item?.upiId || "grandhorizon.jaipur@okaxis",
          taxPercent: Number(item?.taxPercent) || 12,
          cgstPercent: Number(item?.cgstPercent) || 6,
          sgstPercent: Number(item?.sgstPercent) || 6,
          sacCodeAccommodation: item?.sacCodeAccommodation || "996311",
          sacCodeFood: item?.sacCodeFood || "996331",
          invoicePrefix: item?.invoicePrefix || "GH-JAI/2026/",
          bankName: item?.bankName || "HDFC Bank Ltd",
          bankAccountNo: item?.bankAccountNo || "50200084920194",
          bankIfsc: item?.bankIfsc || "HDFC0001234",
          folioPolicy:
            item?.folioPolicy ||
            "Government issued photo ID is mandatory at check-in. Check-out time is strictly 11:00 AM.",
          autoCleaning: item?.autoCleaning !== false,
          currencySymbol: item?.currencySymbol || "₹",
          checkInTime: item?.checkInTime || "12:00 PM",
          checkOutTime: item?.checkOutTime || "11:00 AM",
          managerSignatory: item?.managerSignatory || "Vikram Malhotra (General Manager)",
          logoUrl: item?.logoUrl || undefined,
          enableNightAudit: item?.enableNightAudit !== false,
          enableLostAndFound: item?.enableLostAndFound !== false,
        };
      },
      providesTags: ["Settings"],
    }),

    updateSettings: builder.mutation<HotelSettings, HotelSettings>({
      query: (data) => ({
        url: "/settings",
        method: "PUT",
        body: {
          hotelName: data.hotelName?.trim(),
          chainName: data.chainName?.trim(),
          brandTier: data.brandTier?.trim(),
          tagline: data.tagline?.trim(),
          address: data.address?.trim(),
          city: data.city?.trim(),
          stateCode: data.stateCode?.trim(),
          phone: data.phone?.trim(),
          email: data.email?.trim(),
          website: data.website?.trim(),
          gstin: data.gstin?.trim(),
          cin: data.cin?.trim(),
          fssai: data.fssai?.trim(),
          upiId: data.upiId?.trim(),
          taxPercent: Number(data.taxPercent) || 12,
          cgstPercent: Number(data.cgstPercent) || 6,
          sgstPercent: Number(data.sgstPercent) || 6,
          sacCodeAccommodation: data.sacCodeAccommodation?.trim(),
          sacCodeFood: data.sacCodeFood?.trim(),
          invoicePrefix: data.invoicePrefix?.trim(),
          bankName: data.bankName?.trim(),
          bankAccountNo: data.bankAccountNo?.trim(),
          bankIfsc: data.bankIfsc?.trim(),
          folioPolicy: data.folioPolicy?.trim(),
          autoCleaning: data.autoCleaning !== false,
          currencySymbol: data.currencySymbol?.trim() || "₹",
          checkInTime: data.checkInTime?.trim(),
          checkOutTime: data.checkOutTime?.trim(),
          managerSignatory: data.managerSignatory?.trim(),
          logoUrl: data.logoUrl,
          enableNightAudit: data.enableNightAudit !== false,
          enableLostAndFound: data.enableLostAndFound !== false,
        },
      }),
      transformResponse: (_res: any, _meta: any, arg: HotelSettings) => arg,
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
