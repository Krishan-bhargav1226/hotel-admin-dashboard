import { hotelApi } from "../baseQuery";
import type { RoomType } from "../../../utils/interfaces/Interface";

export type RoomTypePayload = Pick<RoomType, "name" | "description"> & {
  category?: string;
  basePrice?: number;
  bedConfig?: string;
  maxGuests?: number;
  sizeSqFt?: number;
};

const mapBackendRoomType = (item: any): RoomType => {
  let parsedAmenities: string[] = [];
  if (Array.isArray(item.amenities)) {
    parsedAmenities = item.amenities;
  } else if (typeof item.amenities === "string") {
    try {
      parsedAmenities = JSON.parse(item.amenities);
    } catch {
      parsedAmenities = item.amenities.split(",").map((s: string) => s.trim());
    }
  }

  let parsedImages: string[] = [];
  if (Array.isArray(item.images)) {
    parsedImages = item.images;
  } else if (typeof item.images === "string") {
    try {
      parsedImages = JSON.parse(item.images);
    } catch {
      parsedImages = [item.images];
    }
  }

  return {
    id: String(item.id),
    name: item.name,
    description: item.description ?? "",
    image: item.image ?? (parsedImages.length > 0 ? parsedImages[0] : undefined),
    images: parsedImages,
    category: item.category,
    suitableFor: item.suitableFor,
    bedConfig: item.bedConfig,
    maxGuests: Number(item.maxGuests) || 2,
    sizeSqFt: Number(item.sizeSqFt) || 300,
    basePrice: Number(item.basePrice) || 3500,
    amenities: parsedAmenities,
    badge: item.badge,
    createdAt: item.createdDate || new Date().toISOString(),
  };
};

const roomTypeApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomTypes: builder.query<RoomType[], void>({
      query: () => "/room/type",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendRoomType);
      },
      providesTags: ["RoomType"],
    }),

    createRoomType: builder.mutation<RoomType, RoomTypePayload>({
      query: (payload) => {
        const formData = new FormData();
        formData.append("Name", payload.name.trim());
        formData.append("Description", payload.description?.trim() ?? "");
        if (payload.category) formData.append("Category", payload.category);
        if (payload.basePrice) formData.append("BasePrice", String(payload.basePrice));
        if (payload.bedConfig) formData.append("BedConfig", payload.bedConfig);
        if (payload.maxGuests) formData.append("MaxGuests", String(payload.maxGuests));
        if (payload.sizeSqFt) formData.append("SizeSqFt", String(payload.sizeSqFt));
        return {
          url: "/room/type",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (res: any) => mapBackendRoomType(res?.data ?? res),
      invalidatesTags: ["RoomType"],
    }),

    updateRoomType: builder.mutation<RoomType, { id: string; data: RoomTypePayload }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        formData.append("Name", data.name.trim());
        formData.append("Description", data.description?.trim() ?? "");
        if (data.category) formData.append("Category", data.category);
        if (data.basePrice) formData.append("BasePrice", String(data.basePrice));
        if (data.bedConfig) formData.append("BedConfig", data.bedConfig);
        if (data.maxGuests) formData.append("MaxGuests", String(data.maxGuests));
        if (data.sizeSqFt) formData.append("SizeSqFt", String(data.sizeSqFt));
        return {
          url: `/room/type/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: (res: any) => mapBackendRoomType(res?.data ?? res),
      invalidatesTags: ["RoomType", "Room"],
    }),

    deleteRoomType: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/room/type/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["RoomType"],
    }),
  }),
});

export const {
  useGetRoomTypesQuery,
  useCreateRoomTypeMutation,
  useUpdateRoomTypeMutation,
  useDeleteRoomTypeMutation,
} = roomTypeApi;

export default roomTypeApi;
