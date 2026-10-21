import { hotelApi, run } from "../baseQuery";
import { DbKeys, readList, runExclusive, writeList } from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type { Room, RoomType } from "../../../utils/interfaces/Interface";

export type RoomTypePayload = Pick<RoomType, "name" | "description">;

const roomTypeApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomTypes: builder.query<RoomType[], void>({
      queryFn: () => run(() => readList<RoomType>(DbKeys.ROOM_TYPES)),
      providesTags: ["RoomType"],
    }),
    createRoomType: builder.mutation<RoomType, RoomTypePayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<RoomType>(DbKeys.ROOM_TYPES);
            const name = payload.name.trim();
            if (list.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
              throw new Error(`Room type "${name}" already exists`);
            }
            const item: RoomType = {
              id: uid(),
              name,
              description: payload.description?.trim() ?? "",
              createdAt: new Date().toISOString(),
            };
            await writeList(DbKeys.ROOM_TYPES, [...list, item]);
            return item;
          })
        ),
      invalidatesTags: ["RoomType"],
    }),
    updateRoomType: builder.mutation<RoomType, { id: string; data: RoomTypePayload }>({
      queryFn: ({ id, data }) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<RoomType>(DbKeys.ROOM_TYPES);
            const name = data.name.trim();
            if (list.some((t) => t.id !== id && t.name.toLowerCase() === name.toLowerCase())) {
              throw new Error(`Room type "${name}" already exists`);
            }
            let updated: RoomType | undefined;
            const next = list.map((t) =>
              t.id === id ? (updated = { ...t, name, description: data.description?.trim() ?? "" }) : t
            );
            if (!updated) throw new Error("Room type not found");
            await writeList(DbKeys.ROOM_TYPES, next);
            return updated;
          })
        ),
      invalidatesTags: ["RoomType", "Room"],
    }),
    deleteRoomType: builder.mutation<boolean, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const rooms = await readList<Room>(DbKeys.ROOMS);
            if (rooms.some((r) => r.roomTypeId === id)) {
              throw new Error("Rooms of this type exist — reassign their type before deleting");
            }
            const list = await readList<RoomType>(DbKeys.ROOM_TYPES);
            await writeList(DbKeys.ROOM_TYPES, list.filter((t) => t.id !== id));
            return true;
          })
        ),
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
