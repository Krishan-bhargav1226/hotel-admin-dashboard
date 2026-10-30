import { hotelApi } from "../baseQuery";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

const ACTIVE_PROPERTY_KEY = "activePropertyId";
const PROPERTY_STATUSES = ["", "ACTIVE", "INACTIVE", "MAINTENANCE"];

const asStatus = (value: unknown): HotelProperty["status"] => {
  if (typeof value === "string" && PROPERTY_STATUSES.includes(value)) return value as HotelProperty["status"];
  const index = Number(value);
  return (PROPERTY_STATUSES[index] as HotelProperty["status"]) || "ACTIVE";
};

const clip = (value: unknown, max: number) => {
  const text = String(value ?? "").trim();
  return text.length > max ? text.slice(0, max) : text;
};

const phoneValue = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (text.length <= 20) return text;
  const digits = text.replace(/\D/g, "");
  return (digits.length > 10 ? digits.slice(-10) : digits).slice(0, 20);
};

const finite = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const readActivePropertyId = () => {
  try {
    return localStorage.getItem(ACTIVE_PROPERTY_KEY);
  } catch {
    return null;
  }
};

const mapBackendProperty = (item: any): HotelProperty => {
  const id = String(item.id);
  const stored = readActivePropertyId();
  return {
    id,
    name: item.name || "",
    chain: item.chain || "",
    brandTier: item.brandTier || "",
    location: item.location || "",
    starRating: item.starRating || "",
    roomCount: finite(item.roomCount),
    occupancyRate: finite(item.occupancyRate),
    phone: item.phone || "",
    email: item.email || "",
    address: item.address || "",
    gstin: item.gstin || "",
    upiId: item.upiId || "",
    dailyRevenue: finite(item.dailyRevenue),
    adr: finite(item.adr),
    managerName: item.managerName || "",
    status: asStatus(item.status),
    active: stored ? id === stored : false,
  };
};

export interface CreateHotelInput extends Partial<HotelProperty> {
  venueAdminFirstName?: string;
  venueAdminLastName?: string;
  venueAdminEmail?: string;
  venueAdminPhone?: string;
  venueAdminPassword?: string;
  venueAdminOtp?: number;
}

const propertyBody = (input: CreateHotelInput) => ({
  name: clip(input.name, 150),
  chain: clip(input.chain, 150),
  brandTier: clip(input.brandTier, 50),
  location: clip(input.location, 150),
  starRating: clip(input.starRating, 20),
  roomCount: finite(input.roomCount),
  occupancyRate: finite(input.occupancyRate),
  phone: phoneValue(input.phone),
  email: clip(input.email, 150),
  address: clip(input.address, 300),
  gstin: clip(input.gstin, 20),
  upiId: clip(input.upiId, 100),
  dailyRevenue: finite(input.dailyRevenue),
  adr: finite(input.adr),
  managerName: clip(input.managerName, 100),
  status: input.status || "ACTIVE",
  venueAdminFirstName: clip(input.venueAdminFirstName, 50),
  venueAdminLastName: clip(input.venueAdminLastName, 50),
  venueAdminEmail: clip(input.venueAdminEmail, 150),
  venueAdminPhone: phoneValue(input.venueAdminPhone),
  venueAdminPassword: input.venueAdminPassword || "",
  venueAdminOtp: Number(input.venueAdminOtp) || 0,
});

const keepText = (next: unknown, previous: unknown, max: number) => {
  const text = clip(next, max);
  if (text) return text;
  return clip(previous, max) || null;
};

const propertyApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<HotelProperty[], void>({
      query: () => "/property",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendProperty);
      },
      providesTags: ["Property"],
    }),

    switchActiveProperty: builder.mutation<HotelProperty, string>({
      async queryFn(propertyId, _api, _extra, baseQuery) {
        const loaded = await baseQuery({ url: `/property/${propertyId}`, method: "GET" });
        if (loaded.error) return { error: loaded.error };
        const raw = (loaded.data ?? {}) as Record<string, unknown>;
        const property = mapBackendProperty(raw);
        const settingsResult = await baseQuery("/settings");
        if (settingsResult.error) return { error: settingsResult.error };
        const current = (settingsResult.data ?? {}) as Record<string, unknown>;
        const saved = await baseQuery({
          url: "/settings",
          method: "PUT",
          body: {
            ...current,
            hotelName: clip(raw.name ?? property.name, 150),
            chainName: keepText(raw.chain, current.chainName, 150),
            brandTier: keepText(raw.brandTier, current.brandTier, 50),
            address: keepText(raw.address, current.address, 300),
            city: keepText(raw.location, current.city, 100),
            phone: keepText(phoneValue(raw.phone), current.phone, 20),
            email: keepText(raw.email, current.email, 150),
            gstin: keepText(raw.gstin, current.gstin, 20),
            upiId: keepText(raw.upiId, current.upiId, 100),
            managerSignatory: keepText(raw.managerName, current.managerSignatory, 100),
          },
        });
        if (saved.error) return { error: saved.error };
        try {
          localStorage.setItem(ACTIVE_PROPERTY_KEY, property.id);
        } catch {
          // The settings name still identifies the active hotel.
        }
        return { data: { ...property, active: true } };
      },
      invalidatesTags: ["Property", "Settings", "Room", "Stay"],
    }),

    createProperty: builder.mutation<HotelProperty, CreateHotelInput>({
      query: (input) => ({
        url: "/property",
        method: "POST",
        body: propertyBody(input),
      }),
      transformResponse: (res: any, _meta: unknown, arg: CreateHotelInput) =>
        mapBackendProperty(res && typeof res === "object" ? (res.data ?? res) : { ...propertyBody(arg), id: res }),
      invalidatesTags: ["Property"],
    }),

    updateProperty: builder.mutation<HotelProperty, HotelProperty>({
      query: (data) => ({
        url: `/property/${data.id}`,
        method: "PUT",
        body: propertyBody(data),
      }),
      transformResponse: (res: any, _meta: unknown, data: HotelProperty) =>
        mapBackendProperty(res && typeof res === "object" ? (res.data ?? res) : { ...propertyBody(data), id: data.id }),
      invalidatesTags: ["Property"],
    }),

    addRoomToProperty: builder.mutation<
      void,
      { propertyId: string; number: string; floor: string; roomType?: string; roomTypeId?: string; price?: number; notes?: string }
    >({
      query: (payload) => {
        const formData = new FormData();
        formData.append("Number", payload.number.trim());
        formData.append("Floor", payload.floor.trim());
        formData.append("RoomTypeId", payload.roomTypeId || "1");
        formData.append("PropertyId", payload.propertyId);
        if (payload.price) formData.append("BasePrice", String(payload.price));
        if (payload.notes) formData.append("Notes", payload.notes);
        return {
          url: "/room",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Room", "Property"],
    }),

    deleteProperty: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/property/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["Property"],
    }),

    sendVenueAdminOtp: builder.mutation<unknown, { email: string }>({
      query: (body) => ({
        url: "/property/venue-admin/otp",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useSwitchActivePropertyMutation,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useAddRoomToPropertyMutation,
  useDeletePropertyMutation,
  useSendVenueAdminOtpMutation,
} = propertyApi;

export default propertyApi;
