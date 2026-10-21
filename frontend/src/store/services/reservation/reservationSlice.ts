import { hotelApi, run } from "../baseQuery";
import {
  DbKeys,
  readList,
  runExclusive,
  writeList,
} from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type {
  Guest,
  PaymentMode,
  RatePlan,
  Reservation,
  ReservationStatus,
  Room,
  RoomType,
  Stay,
} from "../../../utils/interfaces/Interface";
import { computeExpectedCheckOut } from "../../../utils/helper/billing";

export interface CreateReservationPayload {
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  roomTypeId: string;
  roomId?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  totalAmount: number;
  advanceAmount: number;
  paymentMode: PaymentMode;
  source: Reservation["source"];
  specialRequests?: string;
}

export interface ConvertReservationToStayPayload {
  reservationId: string;
  roomId: string;
  planId: string;
  idType: string;
  idNumber: string;
  address?: string;
}

const reservationApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getReservations: builder.query<Reservation[], void>({
      queryFn: () =>
        run(async () => {
          const list = await readList<Reservation>(DbKeys.RESERVATIONS);
          return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }),
      providesTags: ["Reservation"],
    }),

    createReservation: builder.mutation<Reservation, CreateReservationPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<Reservation>(DbKeys.RESERVATIONS);
            const types = await readList<RoomType>(DbKeys.ROOM_TYPES);
            const rooms = await readList<Room>(DbKeys.ROOMS);

            const roomType = types.find((t) => t.id === payload.roomTypeId);
            const room = payload.roomId ? rooms.find((r) => r.id === payload.roomId) : undefined;

            const now = new Date().toISOString();
            const bookingNo = `BK-${String(list.length + 1).padStart(4, "0")}`;

            const item: Reservation = {
              id: uid(),
              bookingNo,
              guestName: payload.guestName.trim(),
              guestPhone: payload.guestPhone.trim(),
              guestEmail: payload.guestEmail?.trim(),
              roomId: payload.roomId,
              roomNumber: room?.number,
              roomTypeId: payload.roomTypeId,
              roomTypeName: roomType?.name || "Standard",
              checkInDate: payload.checkInDate,
              checkOutDate: payload.checkOutDate,
              nights: payload.nights || 1,
              totalAmount: payload.totalAmount,
              advanceAmount: payload.advanceAmount || 0,
              paymentMode: payload.paymentMode,
              source: payload.source,
              status: "CONFIRMED",
              specialRequests: payload.specialRequests,
              createdAt: now,
              updatedAt: now,
            };

            await writeList(DbKeys.RESERVATIONS, [item, ...list]);
            return item;
          })
        ),
      invalidatesTags: ["Reservation"],
    }),

    updateReservationStatus: builder.mutation<
      Reservation,
      { id: string; status: ReservationStatus }
    >({
      queryFn: ({ id, status }) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<Reservation>(DbKeys.RESERVATIONS);
            const target = list.find((r) => r.id === id);
            if (!target) throw new Error("Reservation not found");

            target.status = status;
            target.updatedAt = new Date().toISOString();

            await writeList(DbKeys.RESERVATIONS, list);
            return target;
          })
        ),
      invalidatesTags: ["Reservation"],
    }),

    convertReservationToStay: builder.mutation<Stay, ConvertReservationToStayPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const reservations = await readList<Reservation>(DbKeys.RESERVATIONS);
            const reservation = reservations.find((r) => r.id === payload.reservationId);
            if (!reservation) throw new Error("Reservation not found");

            const rooms = await readList<Room>(DbKeys.ROOMS);
            const room = rooms.find((r) => r.id === payload.roomId);
            if (!room) throw new Error("Room not found");
            if (room.status !== "AVAILABLE") throw new Error(`Room ${room.number} is not available`);

            const plans = await readList<RatePlan>(DbKeys.RATE_PLANS);
            const plan = plans.find((p) => p.id === payload.planId) || plans[0];
            if (!plan) throw new Error("Rate plan not found");

            const guests = await readList<Guest>(DbKeys.GUESTS);
            let guest = guests.find(
              (g) => g.phone.replace(/\D/g, "") === reservation.guestPhone.replace(/\D/g, "")
            );

            const now = new Date().toISOString();

            if (!guest) {
              guest = {
                id: uid(),
                name: reservation.guestName,
                phone: reservation.guestPhone,
                idType: payload.idType || "AADHAAR",
                idNumber: payload.idNumber || "NA",
                idImage: "",
                address: payload.address || "",
                isFlagged: false,
                flagReason: "",
                createdAt: now,
                updatedAt: now,
              };
              guests.push(guest);
              await writeList(DbKeys.GUESTS, guests);
            }

            const stays = await readList<Stay>(DbKeys.STAYS);
            const stayNo = `ST-${String(stays.length + 1).padStart(4, "0")}`;
            const expectedCheckOutAt = computeExpectedCheckOut(plan, now);

            const newStay: Stay = {
              id: uid(),
              stayNo,
              guestId: guest.id,
              guestName: guest.name,
              guestPhone: guest.phone,
              guestIdType: guest.idType,
              guestIdNumber: guest.idNumber,
              guestIdImage: guest.idImage,
              companions: [],
              partyType: "SOLO",
              guestCount: 1,
              roomId: room.id,
              roomIds: [room.id],
              roomNumber: room.number,
              roomTypeName: reservation.roomTypeName,
              plan,
              checkInAt: now,
              expectedCheckOutAt,
              checkOutAt: null,
              status: "ACTIVE",
              advanceAmount: reservation.advanceAmount || 0,
              advanceMode: reservation.paymentMode || "CASH",
              extraCharges: [],
              discount: 0,
              taxPercent: 12,
              bill: null,
              totalAmount: 0,
              paidAmount: reservation.advanceAmount || 0,
              dueAmount: 0,
              paymentMode: null,
              notes: reservation.specialRequests || `Booked via ${reservation.source} (${reservation.bookingNo})`,
              createdAt: now,
              updatedAt: now,
            };

            // Update room to occupied
            room.status = "OCCUPIED";
            room.updatedAt = now;

            // Update reservation to CHECKED_IN
            reservation.status = "CHECKED_IN";
            reservation.roomId = room.id;
            reservation.roomNumber = room.number;
            reservation.updatedAt = now;

            await writeList(DbKeys.STAYS, [newStay, ...stays]);
            await writeList(DbKeys.ROOMS, rooms);
            await writeList(DbKeys.RESERVATIONS, reservations);

            return newStay;
          })
        ),
      invalidatesTags: ["Reservation", "Stay", "Room", "Guest"],
    }),

    deleteReservation: builder.mutation<void, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<Reservation>(DbKeys.RESERVATIONS);
            const filtered = list.filter((r) => r.id !== id);
            await writeList(DbKeys.RESERVATIONS, filtered);
          })
        ),
      invalidatesTags: ["Reservation"],
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationStatusMutation,
  useConvertReservationToStayMutation,
  useDeleteReservationMutation,
} = reservationApi;
