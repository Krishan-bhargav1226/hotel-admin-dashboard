import { hotelApi } from "../baseQuery";
import type { RoomType } from "../../../utils/interfaces/Interface";

export type RoomTypePayload = Pick<RoomType, "name" | "description"> & {
  category?: string;
  basePrice?: number;
  bedConfig?: string;
  maxGuests?: number;
  sizeSqFt?: number;
};

const asStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Amenities are sometimes stored as a comma-separated string.
  }
  return value.split(",").map((part) => part.trim()).filter(Boolean);
};

const mapBackendRoomType = (item: any): RoomType => {
  if (!item || typeof item !== "object") {
    return {
      id: "",
      name: "",
      description: "",
      images: [],
      category: "COUPLE",
      maxGuests: 2,
      sizeSqFt: 0,
      basePrice: 0,
      amenities: [],
      createdAt: new Date().toISOString(),
    };
  }

  const parsedAmenities = asStringList(item.amenities);
  let parsedImages: string[] = [];
  if (Array.isArray(item.images)) {
    parsedImages = item.images.map(String).filter(Boolean);
  } else if (typeof item.images === "string" && item.images.trim()) {
    try {
      const parsed = JSON.parse(item.images);
      parsedImages = Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [item.images];
    } catch {
      parsedImages = [item.images];
    }
  } else if (typeof item.image === "string" && item.image.trim()) {
    parsedImages = [item.image];
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
