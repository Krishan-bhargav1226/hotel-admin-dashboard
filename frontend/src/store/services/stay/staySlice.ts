import { hotelApi, run } from "../baseQuery";
import {
  DbKeys,
  persistImage,
  readList,
  runExclusive,
  writeList,
} from "../../../utils/db/localDb";
import { normalizePhone, uid } from "../../../utils/helper/helper";
import { calculateBill, computeExpectedCheckOut } from "../../../utils/helper/billing";
import type {
  Companion,
  ExtraCharge,
  Guest,
  PartyType,
  PaymentMode,
  RatePlan,
  Room,
  RoomType,
  Stay,
} from "../../../utils/interfaces/Interface";
import { billForStayRooms, stayRoomCount, stayRoomIds } from "../../../utils/helper/stayRooms";

export interface CheckInPayload {
  guest: {
    name: string;
    phone: string;
    idType: string;
    idNumber: string;
    idImage: string;
    address: string;
  };
  companions: Companion[];
  partyType: PartyType;
  guestCount: number;
  roomIds: string[];
  planId: string;
  checkInAt: string;
  advanceAmount: number;
  advanceMode: PaymentMode;
  taxPercent: number;
  notes: string;
}

export interface CheckOutPayload {
  id: string;
  checkOutAt: string;
  planId?: string;
  extraCharges: ExtraCharge[];
  discount: number;
  taxPercent: number;
  amountReceived: number;
  paymentMode: PaymentMode;
  autoCleaning: boolean;
}

const newestFirst = (a: Stay, b: Stay) => b.checkInAt.localeCompare(a.checkInAt);

const nextStayNo = (stays: Stay[]) =>
  `ST-${String(stays.length + 1).padStart(4, "0")}`;

const stayApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getStays: builder.query<Stay[], void>({
      queryFn: () => run(async () => (await readList<Stay>(DbKeys.STAYS)).sort(newestFirst)),
      providesTags: ["Stay"],
    }),
    getStayById: builder.query<Stay | null, string>({
      queryFn: (id) =>
        run(async () => (await readList<Stay>(DbKeys.STAYS)).find((s) => s.id === id) ?? null),
      providesTags: ["Stay"],
    }),

    /** Guest (new/repeat) + stay + room status — all in one safe step. */
    checkIn: builder.mutation<Stay, CheckInPayload>({
      queryFn: (p) =>
        run(() =>
          runExclusive(async () => {
            const [rooms, plans, types, guests, stays] = await Promise.all([
              readList<Room>(DbKeys.ROOMS),
              readList<RatePlan>(DbKeys.RATE_PLANS),
              readList<RoomType>(DbKeys.ROOM_TYPES),
              readList<Guest>(DbKeys.GUESTS),
              readList<Stay>(DbKeys.STAYS),
            ]);
            const roomIds = [...new Set(p.roomIds.filter(Boolean))];
            if (!roomIds.length) throw new Error("Room not found");
            const selectedRooms = roomIds.map((id) => {
              const room = rooms.find((r) => r.id === id);
              if (!room) throw new Error("Room not found");
              if (room.status !== "AVAILABLE") throw new Error(`Room ${room.number} is not currently available`);
              return room;
            });
            const room = selectedRooms[0];
            const plan = plans.find((x) => x.id === p.planId);
            if (!plan) throw new Error("Rate plan not found");

            const now = new Date().toISOString();
            const phone = normalizePhone(p.guest.phone);
            const idImage = await persistImage(p.guest.idImage);
            const companions: Companion[] = [];
            for (const c of p.companions) {
              companions.push({ ...c, name: c.name.trim(), idImage: await persistImage(c.idImage) });
            }

            // Repeat guest -> update their record; new guest -> create.
            let guest = guests.find((g) => g.phone === phone);
            if (guest) {
              guest = {
                ...guest,
                name: p.guest.name.trim(),
                idType: p.guest.idType,
                idNumber: p.guest.idNumber.trim(),
                idImage: idImage || guest.idImage,
                address: p.guest.address.trim() || guest.address,
                updatedAt: now,
              };
            } else {
              guest = {
                id: uid(),
                name: p.guest.name.trim(),
                phone,
                idType: p.guest.idType,
                idNumber: p.guest.idNumber.trim(),
                idImage,
                address: p.guest.address.trim(),
                isFlagged: false,
                flagReason: "",
                createdAt: now,
                updatedAt: now,
              };
            }
            const savedGuest = guest;
            const nextGuests = guests.some((g) => g.id === savedGuest.id)
              ? guests.map((g) => (g.id === savedGuest.id ? savedGuest : g))
              : [...guests, savedGuest];

            const roomNumbers = selectedRooms.map((r) => r.number).join(", ");
            const roomTypeNames = [
              ...new Set(
                selectedRooms.map((r) => types.find((t) => t.id === r.roomTypeId)?.name ?? "-"),
              ),
            ].join(", ");

            const stay: Stay = {
              id: uid(),
              stayNo: nextStayNo(stays),
              guestId: savedGuest.id,
              guestName: savedGuest.name,
              guestPhone: savedGuest.phone,
              guestIdType: savedGuest.idType,
              guestIdNumber: savedGuest.idNumber,
              guestIdImage: savedGuest.idImage,
              companions,
              partyType: p.partyType,
              guestCount: Math.max(1, p.guestCount || 1 + companions.length),
              roomId: room.id,
              roomIds,
              roomNumber: roomNumbers,
              roomTypeName: roomTypeNames,
              plan,
              checkInAt: p.checkInAt,
              expectedCheckOutAt: computeExpectedCheckOut(plan, p.checkInAt),
              checkOutAt: null,
              status: "ACTIVE",
              advanceAmount: p.advanceAmount,
              advanceMode: p.advanceMode,
              extraCharges: [],
              discount: 0,
              taxPercent: p.taxPercent,
              bill: null,
              totalAmount: 0,
              paidAmount: p.advanceAmount,
              dueAmount: 0,
              paymentMode: null,
              notes: p.notes.trim(),
              createdAt: now,
              updatedAt: now,
            };

            const occupied = new Set(roomIds);
            await writeList(DbKeys.GUESTS, nextGuests);
            await writeList(DbKeys.STAYS, [...stays, stay]);
            await writeList(
              DbKeys.ROOMS,
              rooms.map((r) => (occupied.has(r.id) ? { ...r, status: "OCCUPIED", updatedAt: now } : r))
            );
            return stay;
          })
        ),
      invalidatesTags: ["Stay", "Room", "Guest"],
    }),

    /** Extra charges / discount / notes while the guest is still staying. */
    updateStay: builder.mutation<
      Stay,
      { id: string; data: Partial<Pick<Stay, "extraCharges" | "discount" | "notes">> }
    >({
      queryFn: ({ id, data }) =>
        run(() =>
          runExclusive(async () => {
            const stays = await readList<Stay>(DbKeys.STAYS);
            let updated: Stay | undefined;
            const next = stays.map((s) =>
              s.id === id ? (updated = { ...s, ...data, updatedAt: new Date().toISOString() }) : s
            );
            if (!updated) throw new Error("Stay not found");
            await writeList(DbKeys.STAYS, next);
            return updated;
          })
        ),
      invalidatesTags: ["Stay"],
    }),

    checkOut: builder.mutation<Stay, CheckOutPayload>({
      queryFn: (p) =>
        run(() =>
          runExclusive(async () => {
            const [stays, rooms, plans] = await Promise.all([
              readList<Stay>(DbKeys.STAYS),
              readList<Room>(DbKeys.ROOMS),
              readList<RatePlan>(DbKeys.RATE_PLANS),
            ]);
            const stay = stays.find((s) => s.id === p.id);
            if (!stay) throw new Error("Stay not found");
            if (stay.status === "COMPLETED") throw new Error("This stay has already been checked out");

            // Plan can be switched at checkout (e.g. hourly -> 24 hrs).
            const plan = p.planId ? plans.find((x) => x.id === p.planId) ?? stay.plan : stay.plan;
            const planChanged = plan.id !== stay.plan.id;
            const expected = planChanged
              ? computeExpectedCheckOut(plan, stay.checkInAt)
              : stay.expectedCheckOutAt;

            const singleRoomBill = calculateBill({
              plan,
              checkInAt: stay.checkInAt,
              checkOutAt: p.checkOutAt,
              expectedCheckOutAt: expected,
              extraCharges: p.extraCharges,
              discount: p.discount,
              taxPercent: p.taxPercent,
            });
            const bill = billForStayRooms(singleRoomBill, stayRoomCount(stay));
            const paidAmount = stay.advanceAmount + p.amountReceived;
            const now = new Date().toISOString();
            const updated: Stay = {
              ...stay,
              plan,
              expectedCheckOutAt: expected,
              checkOutAt: p.checkOutAt,
              status: "COMPLETED",
              extraCharges: p.extraCharges,
              discount: bill.discount,
              taxPercent: p.taxPercent,
              bill,
              totalAmount: bill.total,
              paidAmount,
              dueAmount: Math.max(0, bill.total - paidAmount),
              paymentMode: p.paymentMode,
              updatedAt: now,
            };
            await writeList(DbKeys.STAYS, stays.map((s) => (s.id === p.id ? updated : s)));
            const freeing = new Set(stayRoomIds(stay));
            const nextStatus = p.autoCleaning ? "CLEANING" : "AVAILABLE";
            await writeList(
              DbKeys.ROOMS,
              rooms.map((r) =>
                freeing.has(r.id) ? { ...r, status: nextStatus, updatedAt: now } : r
              )
            );
            return updated;
          })
        ),
      invalidatesTags: ["Stay", "Room", "Guest"],
    }),

    collectDue: builder.mutation<Stay, { id: string; amount: number }>({
      queryFn: ({ id, amount }) =>
        run(() =>
          runExclusive(async () => {
            const stays = await readList<Stay>(DbKeys.STAYS);
            let updated: Stay | undefined;
            const next = stays.map((s) => {
              if (s.id !== id) return s;
              const paidAmount = s.paidAmount + amount;
              return (updated = {
                ...s,
                paidAmount,
                dueAmount: Math.max(0, s.totalAmount - paidAmount),
                updatedAt: new Date().toISOString(),
              });
            });
            if (!updated) throw new Error("Stay not found");
            await writeList(DbKeys.STAYS, next);
            return updated;
          })
        ),
      invalidatesTags: ["Stay"],
    }),

    deleteStay: builder.mutation<boolean, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const [stays, rooms] = await Promise.all([
              readList<Stay>(DbKeys.STAYS),
              readList<Room>(DbKeys.ROOMS),
            ]);
            const stay = stays.find((s) => s.id === id);
            if (stay?.status === "ACTIVE") {
              const freeing = new Set(stayRoomIds(stay));
              await writeList(
                DbKeys.ROOMS,
                rooms.map((r) => (freeing.has(r.id) ? { ...r, status: "AVAILABLE" } : r))
              );
            }
            await writeList(DbKeys.STAYS, stays.filter((s) => s.id !== id));
            return true;
          })
        ),
      invalidatesTags: ["Stay", "Room", "Guest"],
    }),
  }),
});

export const {
  useGetStaysQuery,
  useGetStayByIdQuery,
  useCheckInMutation,
  useUpdateStayMutation,
  useCheckOutMutation,
  useCollectDueMutation,
  useDeleteStayMutation,
} = stayApi;

export default stayApi;
