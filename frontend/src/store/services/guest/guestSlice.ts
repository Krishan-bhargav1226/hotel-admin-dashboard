import { hotelApi, run } from "../baseQuery";
import {
  DbKeys,
  deleteImage,
  persistImage,
  readImage,
  readList,
  runExclusive,
  writeList,
} from "../../../utils/db/localDb";
import { normalizePhone, uid } from "../../../utils/helper/helper";
import type {
  Guest,
  GuestLookup,
  GuestWithStats,
  Stay,
} from "../../../utils/interfaces/Interface";

export interface GuestPayload {
  name: string;
  phone: string;
  idType: string;
  idNumber: string;
  idImage: string;
  address: string;
  isFlagged: boolean;
  flagReason: string;
}

const statsFor = (guestId: string, stays: Stay[]) => {
  const mine = stays.filter((s) => s.guestId === guestId);
  const sorted = [...mine].sort((a, b) => b.checkInAt.localeCompare(a.checkInAt));
  return {
    visits: mine.length,
    totalSpent: mine.reduce((sum, s) => sum + (s.status === "COMPLETED" ? s.totalAmount : 0), 0),
    lastStay: sorted[0] ?? null,
  };
};

const guestApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getGuests: builder.query<GuestWithStats[], void>({
      queryFn: () =>
        run(async () => {
          const [guests, stays] = await Promise.all([
            readList<Guest>(DbKeys.GUESTS),
            readList<Stay>(DbKeys.STAYS),
          ]);
          return guests
            .map((g) => {
              const s = statsFor(g.id, stays);
              return {
                ...g,
                visits: s.visits,
                totalSpent: s.totalSpent,
                lastVisitAt: s.lastStay?.checkInAt ?? null,
              };
            })
            .sort((a, b) => (b.lastVisitAt ?? b.createdAt).localeCompare(a.lastVisitAt ?? a.createdAt));
        }),
      providesTags: ["Guest", "Stay"],
    }),
    getGuestById: builder.query<{ guest: Guest; stays: Stay[] } | null, string>({
      queryFn: (id) =>
        run(async () => {
          const [guests, stays] = await Promise.all([
            readList<Guest>(DbKeys.GUESTS),
            readList<Stay>(DbKeys.STAYS),
          ]);
          const guest = guests.find((g) => g.id === id);
          if (!guest) return null;
          return {
            guest,
            stays: stays
              .filter((s) => s.guestId === id)
              .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt)),
          };
        }),
      providesTags: ["Guest", "Stay"],
    }),
    /** Repeat guest lookup: phone number -> last saved ID & visit history. */
    getGuestByPhone: builder.query<GuestLookup | null, string>({
      queryFn: (phone) =>
        run(async () => {
          const p = normalizePhone(phone);
          const [guests, stays] = await Promise.all([
            readList<Guest>(DbKeys.GUESTS),
            readList<Stay>(DbKeys.STAYS),
          ]);
          const guest = guests.find((g) => g.phone === p);
          if (!guest) return null;
          return { guest, ...statsFor(guest.id, stays) };
        }),
      providesTags: ["Guest", "Stay"],
    }),
    createGuest: builder.mutation<Guest, GuestPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const guests = await readList<Guest>(DbKeys.GUESTS);
            const phone = normalizePhone(payload.phone);
            if (guests.some((g) => g.phone === phone)) {
              throw new Error("A guest with this phone number already exists");
            }
            const now = new Date().toISOString();
            const guest: Guest = {
              ...payload,
              id: uid(),
              phone,
              name: payload.name.trim(),
              idImage: await persistImage(payload.idImage),
              createdAt: now,
              updatedAt: now,
            };
            await writeList(DbKeys.GUESTS, [...guests, guest]);
            return guest;
          })
        ),
      invalidatesTags: ["Guest"],
    }),
    updateGuest: builder.mutation<Guest, { id: string; data: GuestPayload }>({
      queryFn: ({ id, data }) =>
        run(() =>
          runExclusive(async () => {
            const guests = await readList<Guest>(DbKeys.GUESTS);
            const phone = normalizePhone(data.phone);
            if (guests.some((g) => g.id !== id && g.phone === phone)) {
              throw new Error("Another guest with this phone number already exists");
            }
            const old = guests.find((g) => g.id === id);
            if (!old) throw new Error("Guest not found");
            const idImage = await persistImage(data.idImage);
            if (old.idImage && old.idImage !== idImage) await deleteImage(old.idImage);
            const updated: Guest = {
              ...old,
              ...data,
              phone,
              name: data.name.trim(),
              idImage,
              updatedAt: new Date().toISOString(),
            };
            await writeList(DbKeys.GUESTS, guests.map((g) => (g.id === id ? updated : g)));
            return updated;
          })
        ),
      invalidatesTags: ["Guest"],
    }),
    deleteGuest: builder.mutation<boolean, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const stays = await readList<Stay>(DbKeys.STAYS);
            if (stays.some((s) => s.guestId === id && s.status === "ACTIVE")) {
              throw new Error("Guest is currently checked in — please check out first");
            }
            const guests = await readList<Guest>(DbKeys.GUESTS);
            const guest = guests.find((g) => g.id === id);
            if (guest?.idImage) await deleteImage(guest.idImage);
            await writeList(DbKeys.GUESTS, guests.filter((g) => g.id !== id));
            return true;
          })
        ),
      invalidatesTags: ["Guest"],
    }),
    getImage: builder.query<string | null, string>({
      queryFn: (key) => run(() => readImage(key)),
      providesTags: (_r, _e, key) => [{ type: "Image", id: key }],
    }),
  }),
});

export const {
  useGetGuestsQuery,
  useGetGuestByIdQuery,
  useGetGuestByPhoneQuery,
  useCreateGuestMutation,
  useUpdateGuestMutation,
  useDeleteGuestMutation,
  useGetImageQuery,
} = guestApi;

export default guestApi;
