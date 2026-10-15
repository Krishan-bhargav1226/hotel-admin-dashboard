import { hotelApi, run } from "../baseQuery";
import { DbKeys, readList, runExclusive, writeList } from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type { Room, RoomStatus } from "../../../utils/interfaces/Interface";

export interface RoomPayload {
  number: string;
  floor: string;
  roomTypeId: string;
  notes: string;
  status?: RoomStatus;
}

export interface BulkRoomPayload {
  from: number;
  to: number;
  floor: string;
  roomTypeId: string;
  prefix?: string;
}

const byNumber = (a: Room, b: Room) =>
  a.number.localeCompare(b.number, undefined, { numeric: true });

const roomApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query<Room[], void>({
      queryFn: () =>
        run(async () => (await readList<Room>(DbKeys.ROOMS)).sort(byNumber)),
      providesTags: ["Room"],
    }),
    createRoom: builder.mutation<Room, RoomPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const number = payload.number.trim();
            if (rooms.some((r) => r.number.toLowerCase() === number.toLowerCase())) {
              throw new Error(`Room ${number} already exists`);
            }
            const now = new Date().toISOString();
            const room: Room = {
              id: uid(),
              number,
              floor: payload.floor.trim(),
              roomTypeId: payload.roomTypeId,
              notes: payload.notes?.trim() ?? "",
              status: payload.status ?? "AVAILABLE",
              createdAt: now,
              updatedAt: now,
            };
            await writeList(DbKeys.ROOMS, [...rooms, room]);
            return room;
          })
        ),
      invalidatesTags: ["Room"],
    }),
    createBulkRooms: builder.mutation<number, BulkRoomPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            if (payload.to < payload.from) throw new Error("'To' number 'From' se bada hona chahiye");
            if (payload.to - payload.from > 199) throw new Error("Ek baar me max 200 rooms add kar sakte ho");
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const existing = new Set(rooms.map((r) => r.number.toLowerCase()));
            const now = new Date().toISOString();
            const added: Room[] = [];
            for (let n = payload.from; n <= payload.to; n++) {
              const number = `${payload.prefix ?? ""}${n}`;
              if (existing.has(number.toLowerCase())) continue;
              added.push({
                id: uid(),
                number,
                floor: payload.floor.trim(),
                roomTypeId: payload.roomTypeId,
                notes: "",
                status: "AVAILABLE",
                createdAt: now,
                updatedAt: now,
              });
            }
            await writeList(DbKeys.ROOMS, [...rooms, ...added]);
            return added.length;
          })
        ),
      invalidatesTags: ["Room"],
    }),
    updateRoom: builder.mutation<Room, { id: string; data: RoomPayload }>({
      queryFn: ({ id, data }) =>
        run(() =>
          runExclusive(async () => {
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const number = data.number.trim();
            if (rooms.some((r) => r.id !== id && r.number.toLowerCase() === number.toLowerCase())) {
              throw new Error(`Room ${number} already exists`);
            }
            let updated: Room | undefined;
            const next = rooms.map((r) =>
              r.id === id
                ? (updated = {
                    ...r,
                    number,
                    floor: data.floor.trim(),
                    roomTypeId: data.roomTypeId,
                    notes: data.notes?.trim() ?? "",
                    updatedAt: new Date().toISOString(),
                  })
                : r
            );
            if (!updated) throw new Error("Room not found");
            await writeList(DbKeys.ROOMS, next);
            return updated;
          })
        ),
      invalidatesTags: ["Room"],
    }),
    updateRoomStatus: builder.mutation<Room, { id: string; status: RoomStatus }>({
      queryFn: ({ id, status }) =>
        run(() =>
          runExclusive(async () => {
            const rooms = await readList<Room>(DbKeys.ROOMS);
            let updated: Room | undefined;
            const next = rooms.map((r) => {
              if (r.id !== id) return r;
              if (r.status === "OCCUPIED" && status !== "OCCUPIED") {
                throw new Error("Occupied room ko pehle check-out karo");
              }
              return (updated = { ...r, status, updatedAt: new Date().toISOString() });
            });
            if (!updated) throw new Error("Room not found");
            await writeList(DbKeys.ROOMS, next);
            return updated;
          })
        ),
      invalidatesTags: ["Room"],
    }),
    deleteRoom: builder.mutation<boolean, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const room = rooms.find((r) => r.id === id);
            if (room?.status === "OCCUPIED") {
              throw new Error("Occupied room delete nahi ho sakta — pehle check-out karo");
            }
            await writeList(DbKeys.ROOMS, rooms.filter((r) => r.id !== id));
            return true;
          })
        ),
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
