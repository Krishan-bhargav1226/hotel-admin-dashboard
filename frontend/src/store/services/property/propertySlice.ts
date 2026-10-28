import { hotelApi } from "../baseQuery";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

const mapBackendProperty = (item: any): HotelProperty => ({
  id: String(item.id),
  name: item.name,
  chain: item.chain || "Grand Horizon Hotels",
  brandTier: item.brandTier || "Palace",
  location: item.location || "Jaipur",
  starRating: item.starRating || "5 Star",
  roomCount: Number(item.roomCount) || 10,
  occupancyRate: Number(item.occupancyRate) || 0,
  phone: item.phone || "",
  email: item.email || "",
  address: item.address || "",
  gstin: item.gstin || "",
  upiId: item.upiId || "",
  dailyRevenue: Number(item.dailyRevenue) || 0,
  adr: Number(item.adr) || 4500,
  managerName: item.managerName || "General Manager",
  status: item.status || "ACTIVE",
  active: item.id === 1 || String(item.id) === "1",
});

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
      query: (propertyId) => ({
        url: `/property/${propertyId}`,
        method: "GET",
      }),
      transformResponse: (res: any) => {
        const item = mapBackendProperty(res?.data ?? res);
        return { ...item, active: true };
      },
      invalidatesTags: ["Property", "Settings", "Room", "Stay"],
    }),

    createProperty: builder.mutation<HotelProperty, Partial<HotelProperty>>({
      query: (input) => ({
        url: "/property",
        method: "POST",
        body: {
          name: input.name?.trim() || "New Hotel Property",
          chain: input.chain?.trim() || "Grand Horizon Hotels",
          brandTier: input.brandTier?.trim() || "Palace",
          location: input.location?.trim() || "Jaipur",
          starRating: input.starRating?.trim() || "5 Star",
          roomCount: Number(input.roomCount) || 10,
          occupancyRate: Number(input.occupancyRate) || 0,
          phone: input.phone?.trim() || "",
          email: input.email?.trim() || "",
          address: input.address?.trim() || "",
          gstin: input.gstin?.trim() || "",
          upiId: input.upiId?.trim() || "",
          dailyRevenue: Number(input.dailyRevenue) || 0,
          adr: Number(input.adr) || 4500,
          managerName: input.managerName?.trim() || "General Manager",
          status: input.status || "ACTIVE",
        },
      }),
      transformResponse: (res: any) => mapBackendProperty(res?.data ?? res),
      invalidatesTags: ["Property"],
    }),

    updateProperty: builder.mutation<HotelProperty, HotelProperty>({
      query: (data) => ({
        url: `/property/${data.id}`,
        method: "PUT",
        body: {
          name: data.name.trim(),
          chain: data.chain,
          brandTier: data.brandTier,
          location: data.location,
          starRating: data.starRating,
          roomCount: Number(data.roomCount),
          occupancyRate: Number(data.occupancyRate),
          phone: data.phone,
          email: data.email,
          address: data.address,
          gstin: data.gstin,
          upiId: data.upiId,
          dailyRevenue: Number(data.dailyRevenue),
          adr: Number(data.adr),
          managerName: data.managerName,
          status: data.status,
        },
      }),
      transformResponse: (res: any) => mapBackendProperty(res?.data ?? res),
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
  }),
});

export const {
  useGetPropertiesQuery,
  useSwitchActivePropertyMutation,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useAddRoomToPropertyMutation,
  useDeletePropertyMutation,
} = propertyApi;

export default propertyApi;
