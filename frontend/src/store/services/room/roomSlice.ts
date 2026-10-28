import { hotelApi } from "../baseQuery";
import type { Room, RoomStatus } from "../../../utils/interfaces/Interface";

export interface RoomPayload {
  number: string;
  floor: string;
  roomTypeId: string;
  notes: string;
  status?: RoomStatus;
  basePrice?: number;
  bedType?: string;
  category?: string;
}

export interface BulkRoomPayload {
  from: number;
  to: number;
  floor: string;
  roomTypeId: string;
  prefix?: string;
}

const mapBackendRoom = (item: any): Room => {
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
    number: String(item.number),
    floor: item.floor ? String(item.floor) : "1",
    roomTypeId: String(item.roomTypeId),
    status: (item.status as RoomStatus) || "AVAILABLE",
    notes: item.notes || "",
    image: item.image || item.roomType?.image || (parsedImages.length > 0 ? parsedImages[0] : undefined),
    images: parsedImages,
    bedType: item.bedType || undefined,
    category: item.category || undefined,
    suitableFor: item.suitableFor || undefined,
    bedConfig: item.bedConfig || undefined,
    maxGuests: Number(item.maxGuests) || 2,
    sizeSqFt: Number(item.sizeSqFt) || 300,
    basePrice: Number(item.basePrice) || 3500,
    amenities: parsedAmenities,
    badge: item.badge || undefined,
    propertyId: item.propertyId ? String(item.propertyId) : undefined,
    propertyName: item.propertyName || undefined,
    createdAt: item.createdDate || new Date().toISOString(),
    updatedAt: item.updatedDate || item.createdDate || new Date().toISOString(),
  };
};

const roomApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query<Room[], void>({
      query: () => "/room",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendRoom).sort((a: Room, b: Room) =>
          a.number.localeCompare(b.number, undefined, { numeric: true })
        );
      },
      providesTags: ["Room"],
    }),

    createRoom: builder.mutation<Room, RoomPayload>({
      query: (payload) => {
        const formData = new FormData();
        formData.append("Number", payload.number.trim());
        formData.append("Floor", payload.floor.trim());
        formData.append("RoomTypeId", payload.roomTypeId);
        formData.append("Notes", payload.notes?.trim() ?? "");
        if (payload.status) formData.append("Status", payload.status);
        if (payload.basePrice) formData.append("BasePrice", String(payload.basePrice));
        if (payload.bedType) formData.append("BedType", payload.bedType);
        if (payload.category) formData.append("Category", payload.category);
        return {
          url: "/room",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (res: any) => mapBackendRoom(res?.data ?? res),
      invalidatesTags: ["Room"],
    }),

    createBulkRooms: builder.mutation<number, BulkRoomPayload>({
      query: (payload) => ({
        url: "/room/bulk",
        method: "POST",
        body: {
          from: payload.from,
          to: payload.to,
          floor: payload.floor.trim(),
          roomTypeId: Number(payload.roomTypeId),
          prefix: payload.prefix ?? "",
        },
      }),
      transformResponse: (res: any) => res?.data ?? 1,
      invalidatesTags: ["Room"],
    }),

    updateRoom: builder.mutation<Room, { id: string; data: RoomPayload }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        formData.append("Number", data.number.trim());
        formData.append("Floor", data.floor.trim());
        formData.append("RoomTypeId", data.roomTypeId);
        formData.append("Notes", data.notes?.trim() ?? "");
        if (data.status) formData.append("Status", data.status);
        if (data.basePrice) formData.append("BasePrice", String(data.basePrice));
        if (data.bedType) formData.append("BedType", data.bedType);
        if (data.category) formData.append("Category", data.category);
        return {
          url: `/room/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: (res: any) => mapBackendRoom(res?.data ?? res),
      invalidatesTags: ["Room"],
    }),

    updateRoomStatus: builder.mutation<void, { id: string; status: RoomStatus }>({
      query: ({ id, status }) => ({
        url: `/room/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Room"],
    }),

    deleteRoom: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/room/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["Room"],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useCreateBulkRoomsMutation,
  useUpdateRoomMutation,
  useUpdateRoomStatusMutation,
  useDeleteRoomMutation,
} = roomApi;

export default roomApi;
