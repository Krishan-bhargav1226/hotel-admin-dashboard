import { hotelApi } from "../baseQuery";
import type {
  Companion,
  ExtraCharge,
  PartyType,
  PaymentMode,
  Stay,
  StayStatus,
} from "../../../utils/interfaces/Interface";

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
  reservationId?: string;
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

const mapBackendStay = (item: any): Stay => {
  const companions: Companion[] = (item.companions || []).map((c: any) => ({
    id: String(c.id),
    name: c.name || "",
    idType: c.idType || "",
    idNumber: c.idNumber || "",
    idImage: c.idImage || "",
  }));

  const extraCharges: ExtraCharge[] = (item.extraCharges || []).map((ec: any) => ({
    id: String(ec.id),
    label: ec.label || "",
    amount: Number(ec.amount) || 0,
  }));

  const roomIds: string[] =
    item.roomIds && item.roomIds.length
      ? item.roomIds.map(String)
      : [String(item.roomId)];

  return {
    id: String(item.id),
    stayNo: item.stayNo,
    guestId: String(item.guestId),
    guestName: item.guestName,
    guestPhone: item.guestPhone,
    guestIdType: item.guestIdType || "",
    guestIdNumber: item.guestIdNumber || "",
    guestIdImage: item.guestIdImage || "",
    companions,
    partyType: item.partyType,
    guestCount: Number(item.guestCount) || 1,
    roomId: String(item.roomId),
    roomIds,
    roomNumber: item.roomNumber,
    roomTypeName: item.roomTypeName || "Standard",
    plan: {
      id: String(item.ratePlanId),
      name: item.planName || "Overnight",
      kind: item.planKind || "FIXED",
      rate: Number(item.planRate) || 0,
      durationHours: Number(item.planDurationHours) || 24,
      checkoutTime: item.planCheckoutTime || "",
      minHours: Number(item.planMinHours) || 0,
      overtimeRate: Number(item.planOvertimeRate) || 0,
      graceMinutes: Number(item.planGraceMinutes) || 30,
      roomTypeIds: [],
      isActive: true,
      createdAt: item.createdDate || new Date().toISOString(),
    },
    checkInAt: item.checkInAt,
    expectedCheckOutAt: item.expectedCheckOutAt ?? null,
    checkOutAt: item.checkOutAt ?? null,
    status: (item.status as StayStatus) || "ACTIVE",
    advanceAmount: Number(item.advanceAmount) || 0,
    advanceMode: item.advanceMode || "CASH",
    extraCharges,
    discount: Number(item.discount) || 0,
    taxPercent: Number(item.taxPercent) || 12,
    bill: item.bill
      ? {
          elapsedMinutes: item.bill.elapsedMinutes || 0,
          billableHours: item.bill.billableHours || 0,
          baseLabel: item.bill.baseLabel || "Base",
          baseAmount: Number(item.bill.baseAmount) || 0,
          overtimeHours: Number(item.bill.overtimeHours) || 0,
          overtimeAmount: Number(item.bill.overtimeAmount) || 0,
          extraTotal: Number(item.bill.extraTotal) || 0,
          grossAmount: Number(item.bill.grossAmount) || 0,
          discount: Number(item.bill.discount) || 0,
          taxableAmount: Number(item.bill.taxableAmount) || 0,
          taxPercent: Number(item.bill.taxPercent) || 12,
          taxAmount: Number(item.bill.taxAmount) || 0,
          total: Number(item.bill.total) || 0,
        }
      : null,
    totalAmount: Number(item.totalAmount) || 0,
    paidAmount: Number(item.paidAmount) || 0,
    dueAmount: Number(item.dueAmount) || 0,
    paymentMode: item.paymentMode ?? null,
    notes: item.notes ?? "",
    createdAt: item.createdDate || new Date().toISOString(),
    updatedAt: item.updatedDate || item.createdDate || new Date().toISOString(),
  };
};

const stayApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getStays: builder.query<Stay[], void>({
      query: () => "/stay",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendStay).sort((a: Stay, b: Stay) =>
          b.checkInAt.localeCompare(a.checkInAt)
        );
      },
      providesTags: ["Stay", "Room"],
    }),

    getStayById: builder.query<Stay | null, string>({
      query: (id) => `/stay/${id}`,
      transformResponse: (response: any) => {
        const item = response?.data ?? response;
        return item ? mapBackendStay(item) : null;
      },
      providesTags: ["Stay"],
    }),

    checkIn: builder.mutation<Stay, CheckInPayload>({
      query: (p) => ({
        url: "/stay/check-in",
        method: "POST",
        body: {
          guest: {
            name: p.guest.name.trim(),
            phone: p.guest.phone.trim(),
            idType: p.guest.idType || "Aadhaar",
            idNumber: p.guest.idNumber || "",
            idImage: p.guest.idImage || "",
            address: p.guest.address || "",
          },
          companions: (p.companions || []).map((c) => ({
            name: c.name?.trim(),
            idType: c.idType,
            idNumber: c.idNumber,
            idImage: c.idImage,
          })),
          partyType: p.partyType || "SOLO",
          guestCount: Number(p.guestCount) || 1,
          roomIds: p.roomIds.map(Number),
          ratePlanId: Number(p.planId),
          checkInAt: p.checkInAt || new Date().toISOString(),
          advanceAmount: Number(p.advanceAmount) || 0,
          advanceMode: p.advanceMode || "CASH",
          taxPercent: Number(p.taxPercent) || 12,
          notes: p.notes?.trim() || "",
          reservationId: p.reservationId ? Number(p.reservationId) : null,
        },
      }),
      transformResponse: (res: any) => mapBackendStay(res?.data ?? res),
      invalidatesTags: ["Stay", "Room", "Guest", "Reservation", "Report"],
    }),

    checkOut: builder.mutation<Stay, CheckOutPayload>({
      query: (p) => ({
        url: `/stay/${p.id}/check-out`,
        method: "POST",
        body: {
          id: Number(p.id),
          checkOutAt: p.checkOutAt || new Date().toISOString(),
          ratePlanId: p.planId ? Number(p.planId) : null,
          extraCharges: (p.extraCharges || []).map((ec) => ({
            label: ec.label,
            amount: Number(ec.amount),
          })),
          discount: Number(p.discount) || 0,
          taxPercent: Number(p.taxPercent) || 12,
          amountReceived: Number(p.amountReceived) || 0,
          paymentMode: p.paymentMode || "CASH",
          autoCleaning: p.autoCleaning !== false,
        },
      }),
      transformResponse: (res: any) => mapBackendStay(res?.data ?? res),
      invalidatesTags: ["Stay", "Room", "Housekeeping", "Report"],
    }),

    collectPayment: builder.mutation<
      Stay,
      { id: string; amount: number; paymentMode: PaymentMode; notes?: string }
    >({
      query: ({ id, amount, paymentMode, notes }) => ({
        url: `/stay/${id}/payment`,
        method: "POST",
        body: {
          id: Number(id),
          amount: Number(amount),
          paymentMode,
          notes: notes?.trim() || "",
        },
      }),
      transformResponse: (res: any) => mapBackendStay(res?.data ?? res),
      invalidatesTags: ["Stay", "Report"],
    }),

    collectDue: builder.mutation<
      Stay,
      { id: string; amount: number; paymentMode?: PaymentMode; notes?: string }
    >({
      query: ({ id, amount, paymentMode, notes }) => ({
        url: `/stay/${id}/payment`,
        method: "POST",
        body: {
          id: Number(id),
          amount: Number(amount),
          paymentMode: paymentMode || "CASH",
          notes: notes?.trim() || "",
        },
      }),
      transformResponse: (res: any) => mapBackendStay(res?.data ?? res),
      invalidatesTags: ["Stay", "Report"],
    }),

    updateStay: builder.mutation<
      Stay,
      { id: string; data: Partial<Stay> }
    >({
      query: ({ id, data }) => ({
        url: `/stay/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (res: any) => mapBackendStay(res?.data ?? res),
      invalidatesTags: ["Stay", "Report"],
    }),

    deleteStay: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/stay/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["Stay", "Room", "Report"],
    }),
  }),
});

export const {
  useGetStaysQuery,
  useGetStayByIdQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useCollectPaymentMutation,
  useCollectDueMutation,
  useUpdateStayMutation,
  useDeleteStayMutation,
} = stayApi;

export default stayApi;
