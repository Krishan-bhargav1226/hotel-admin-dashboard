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
  image?: string;
  maxGuests?: number;
  sizeSqFt?: number;
  suitableFor?: string;
  bedConfig?: string;
  amenities?: string[] | string;
  badge?: string;
  propertyId?: string;
}

const appendRoomForm = (formData: FormData, payload: RoomPayload) => {
  formData.append("Number", payload.number.trim());
  formData.append("Floor", payload.floor.trim());
  formData.append("RoomTypeId", payload.roomTypeId);
  formData.append("Notes", payload.notes?.trim() ?? "");
  if (payload.status) formData.append("Status", payload.status);
  if (payload.basePrice != null) formData.append("BasePrice", String(payload.basePrice));
  if (payload.maxGuests != null) formData.append("MaxGuests", String(payload.maxGuests));
  if (payload.sizeSqFt != null) formData.append("SizeSqFt", String(payload.sizeSqFt));
  if (payload.bedType != null) formData.append("BedType", payload.bedType);
  if (payload.category) formData.append("Category", payload.category);
  if (payload.image != null) formData.append("Image", payload.image);
  if (payload.suitableFor != null) formData.append("SuitableFor", payload.suitableFor);
  if (payload.bedConfig != null) formData.append("BedConfig", payload.bedConfig);
  if (payload.badge != null) formData.append("Badge", payload.badge);
  if (payload.propertyId) formData.append("PropertyId", payload.propertyId);
  if (payload.amenities != null) {
    formData.append(
      "Amenities",
      Array.isArray(payload.amenities) ? JSON.stringify(payload.amenities) : payload.amenities,
    );
  }
};

const createdId = (res: unknown) => (typeof res === "number" ? res : 0);

export interface BulkRoomPayload {
  from: number;
  to: number;
  floor: string;
  roomTypeId: string;
  prefix?: string;
  propertyId?: string;
}

const mapBackendRoom = (item: any): Room => {
  if (!item || typeof item !== "object") {
    return {
      id: "",
      number: "",
      floor: "",
      roomTypeId: "",
      status: "AVAILABLE",
      notes: "",
      images: [],
      amenities: [],
      maxGuests: 0,
      sizeSqFt: 0,
      basePrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

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
        return rawList.map(mapBackendRoom).filter((room: Room) => room.id).sort((a: Room, b: Room) =>
          a.number.localeCompare(b.number, undefined, { numeric: true })
        );
      },
      providesTags: ["Room"],
    }),

    createRoom: builder.mutation<number, RoomPayload>({
      query: (payload) => {
        const formData = new FormData();
        appendRoomForm(formData, payload);
        return {
          url: "/room",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (res: unknown) => createdId(res),
      invalidatesTags: ["Room", "Housekeeping"],
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
          propertyId: payload.propertyId ? Number(payload.propertyId) : null,
        },
      }),
      transformResponse: (res: unknown) => (typeof res === "number" ? res : 0),
      invalidatesTags: ["Room", "Housekeeping"],
    }),

    updateRoom: builder.mutation<void, { id: string; data: RoomPayload }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        appendRoomForm(formData, data);
        return {
          url: `/room/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Room", "Housekeeping"],
    }),

    updateRoomStatus: builder.mutation<void, { id: string; status: RoomStatus }>({
      query: ({ id, status }) => ({
        url: `/room/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Room", "Housekeeping", "Stay", "Reservation"],
    }),

    deleteRoom: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/room/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["Room", "Housekeeping", "Stay", "Reservation"],
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
