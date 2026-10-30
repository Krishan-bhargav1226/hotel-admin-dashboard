import { hotelApi } from "../baseQuery";
import type {
  PaymentMode,
  Reservation,
  ReservationStatus,
} from "../../../utils/interfaces/Interface";

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
  guestName?: string;
  guestPhone?: string;
  advanceAmount?: number;
  advanceMode?: PaymentMode;
}

const mapBackendReservation = (item: any): Reservation => ({
  id: String(item.id),
  bookingNo: item.bookingNo,
  guestName: item.guestName,
  guestPhone: item.guestPhone,
  guestEmail: item.guestEmail || undefined,
  roomId: item.roomId ? String(item.roomId) : undefined,
  roomNumber: item.roomNumber || undefined,
  roomTypeId: String(item.roomTypeId),
  roomTypeName: item.roomTypeName || "Standard",
  checkInDate: item.checkInDate,
  checkOutDate: item.checkOutDate,
  nights: Number(item.nights) || 1,
  totalAmount: Number(item.totalAmount) || 0,
  advanceAmount: Number(item.advanceAmount) || 0,
  paymentMode: item.paymentMode || "CASH",
  source: item.source || "PHONE",
  status: (item.status as ReservationStatus) || "CONFIRMED",
  specialRequests: item.specialRequests || undefined,
  createdAt: item.createdDate || new Date().toISOString(),
  updatedAt: item.updatedDate || item.createdDate || new Date().toISOString(),
});

const reservationApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getReservations: builder.query<Reservation[], void>({
      query: () => "/reservation",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendReservation).sort((a: Reservation, b: Reservation) =>
          b.createdAt.localeCompare(a.createdAt)
        );
      },
      providesTags: ["Reservation"],
    }),

    createReservation: builder.mutation<Reservation, CreateReservationPayload>({
      query: (payload) => ({
        url: "/reservation",
        method: "POST",
        body: {
          guestName: payload.guestName.trim(),
          guestPhone: payload.guestPhone.trim(),
          guestEmail: payload.guestEmail?.trim() || null,
          roomId: payload.roomId ? Number(payload.roomId) : null,
          roomTypeId: Number(payload.roomTypeId),
          checkInDate: payload.checkInDate,
          checkOutDate: payload.checkOutDate,
          nights: Number(payload.nights),
          totalAmount: Number(payload.totalAmount),
          advanceAmount: Number(payload.advanceAmount),
          paymentMode: payload.paymentMode || "CASH",
          source: payload.source || "PHONE",
          specialRequests: payload.specialRequests?.trim() || null,
        },
      }),
      transformResponse: (res: any) => mapBackendReservation(res?.data ?? res),
      invalidatesTags: ["Reservation", "Room", "Report"],
    }),

    updateReservationStatus: builder.mutation<
      void,
      { id: string; status: ReservationStatus }
    >({
      query: ({ id, status }) => ({
        url: `/reservation/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Reservation", "Room", "Report"],
    }),

    cancelReservation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reservation/${id}/status`,
        method: "PUT",
        body: { status: "CANCELLED" },
      }),
      invalidatesTags: ["Reservation", "Room", "Report"],
    }),

    assignRoom: builder.mutation<void, { id: string; roomId: string }>({
      query: ({ id, roomId }) => ({
        url: `/reservation/${id}`,
        method: "PUT",
        body: { roomId: Number(roomId) },
      }),
      invalidatesTags: ["Reservation", "Room"],
    }),

    convertReservationToStay: builder.mutation<
      { roomNumber: string },
      ConvertReservationToStayPayload
    >({
      query: (p) => ({
        url: "/stay/check-in",
        method: "POST",
        body: {
          guest: {
            name: p.guestName?.trim() || "",
            phone: p.guestPhone?.trim() || "",
            idType: p.idType || "AADHAAR",
            idNumber: p.idNumber,
            address: p.address || "",
          },
          companions: [],
          partyType: "SOLO",
          guestCount: 1,
          roomIds: [Number(p.roomId)],
          ratePlanId: Number(p.planId),
          advanceAmount: p.advanceAmount ?? 0,
          advanceMode: p.advanceMode ?? "CASH",
          taxPercent: 12,
          notes: "Converted from reservation",
          reservationId: Number(p.reservationId),
        },
      }),
      transformResponse: (res: any, _meta: any, arg: ConvertReservationToStayPayload) => {
        const stay = res?.data ?? res;
        const roomNumber = stay && typeof stay === "object" ? stay.roomNumber : undefined;
        return { roomNumber: roomNumber ? String(roomNumber) : String(arg.roomId) };
      },
      invalidatesTags: ["Reservation", "Stay", "Room", "Report"],
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationStatusMutation,
  useCancelReservationMutation,
  useAssignRoomMutation,
  useConvertReservationToStayMutation,
} = reservationApi;

export default reservationApi;
