import { hotelApi } from "../baseQuery";
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

const mapBackendGuest = (item: any): GuestWithStats => ({
  id: String(item.id),
  name: item.name,
  phone: item.phone,
  idType: item.idType || "Aadhaar",
  idNumber: item.idNumber || "",
  idImage: item.idImage || "",
  address: item.address || "",
  isFlagged: Boolean(item.isFlagged),
  flagReason: item.flagReason || "",
  visits: Number(item.visits) || 1,
  totalSpent: Number(item.totalSpent) || 4500,
  lastVisitAt: item.lastVisitAt || item.createdDate || null,
  createdAt: item.createdDate || new Date().toISOString(),
  updatedAt: item.updatedDate || item.createdDate || new Date().toISOString(),
});

const guestApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getGuests: builder.query<GuestWithStats[], void>({
      query: () => "/guest",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendGuest);
      },
      providesTags: ["Guest", "Stay"],
    }),

    getGuestById: builder.query<{ guest: Guest; stays: Stay[] } | null, string>({
      query: (id) => `/guest/${id}`,
      transformResponse: (response: any) => {
        const item = response?.data ?? response;
        if (!item) return null;
        const staysList: any[] = Array.isArray(item.stays) ? item.stays : [];
        const mappedStays: Stay[] = staysList.map((s: any) => ({
          id: String(s.id),
          stayNo: s.stayNo,
          guestId: String(s.guestId),
          guestName: s.guestName,
          guestPhone: s.guestPhone,
          guestIdType: s.guestIdType || "",
          guestIdNumber: s.guestIdNumber || "",
          guestIdImage: s.guestIdImage || "",
          companions: (s.companions || []).map((c: any) => ({
            name: c.name || "",
            idType: c.idType || "",
            idNumber: c.idNumber || "",
            idImage: c.idImage || "",
          })),
          partyType: s.partyType,
          guestCount: Number(s.guestCount) || 1,
          roomId: String(s.roomId),
          roomIds: s.roomIds && s.roomIds.length ? s.roomIds.map(String) : [String(s.roomId)],
          roomNumber: s.roomNumber,
          roomTypeName: s.roomTypeName || "Standard",
          plan: {
            id: String(s.ratePlanId),
            name: s.planName || "Overnight",
            kind: s.planKind || "FIXED",
            rate: Number(s.planRate) || 0,
            durationHours: Number(s.planDurationHours) || 24,
            checkoutTime: s.planCheckoutTime || "",
            minHours: Number(s.planMinHours) || 0,
            overtimeRate: Number(s.planOvertimeRate) || 0,
            graceMinutes: Number(s.planGraceMinutes) || 30,
            roomTypeIds: [],
            isActive: true,
            createdAt: s.createdDate || new Date().toISOString(),
          },
          checkInAt: s.checkInAt,
          expectedCheckOutAt: s.expectedCheckOutAt ?? null,
          checkOutAt: s.checkOutAt ?? null,
          status: s.status || "ACTIVE",
          advanceAmount: Number(s.advanceAmount) || 0,
          advanceMode: s.advanceMode || "CASH",
          extraCharges: (s.extraCharges || []).map((ec: any) => ({
            id: String(ec.id),
            label: ec.label || "",
            amount: Number(ec.amount) || 0,
          })),
          discount: Number(s.discount) || 0,
          taxPercent: Number(s.taxPercent) || 12,
          bill: null,
          totalAmount: Number(s.totalAmount) || 0,
          paidAmount: Number(s.paidAmount) || 0,
          dueAmount: Number(s.dueAmount) || 0,
          paymentMode: s.paymentMode ?? null,
          notes: s.notes ?? "",
          createdAt: s.createdDate || new Date().toISOString(),
          updatedAt: s.updatedDate || s.createdDate || new Date().toISOString(),
        }));
        return {
          guest: mapBackendGuest(item),
          stays: mappedStays,
        };
      },
      providesTags: ["Guest", "Stay"],
    }),

    getGuestByPhone: builder.query<GuestLookup | null, string>({
      query: (phone) => `/guest?search=${encodeURIComponent(phone.trim())}`,
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        const item = rawList[0];
        if (!item) return null;
        const guest = mapBackendGuest(item);
        return {
          guest,
          visits: guest.visits,
          totalSpent: guest.totalSpent,
          lastStay: null,
        };
      },
      providesTags: ["Guest", "Stay"],
    }),

    getImage: builder.query<string, string>({
      queryFn: (key) => {
        if (!key) return { data: "" };
        if (key.startsWith("data:") || key.startsWith("http")) return { data: key };
        return { data: `http://localhost:7444${key.startsWith("/") ? "" : "/"}${key}` };
      },
    }),

    createGuest: builder.mutation<Guest, GuestPayload>({
      query: (payload) => {
        const formData = new FormData();
        formData.append("Name", payload.name.trim());
        formData.append("Phone", payload.phone.trim());
        formData.append("IdType", payload.idType || "Aadhaar");
        formData.append("IdNumber", payload.idNumber || "");
        formData.append("Address", payload.address || "");
        formData.append("IsFlagged", String(payload.isFlagged));
        formData.append("FlagReason", payload.flagReason || "");
        if (payload.idImage) formData.append("IdImage", payload.idImage);
        return {
          url: "/guest",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (res: any) => mapBackendGuest(res?.data ?? res),
      invalidatesTags: ["Guest"],
    }),

    updateGuest: builder.mutation<Guest, { id: string; data: GuestPayload }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        formData.append("Name", data.name.trim());
        formData.append("Phone", data.phone.trim());
        formData.append("IdType", data.idType || "Aadhaar");
        formData.append("IdNumber", data.idNumber || "");
        formData.append("Address", data.address || "");
        formData.append("IsFlagged", String(data.isFlagged));
        formData.append("FlagReason", data.flagReason || "");
        if (data.idImage) formData.append("IdImage", data.idImage);
        return {
          url: `/guest/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: (res: any) => mapBackendGuest(res?.data ?? res),
      invalidatesTags: ["Guest"],
    }),

    deleteGuest: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/guest/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["Guest"],
    }),
  }),
});

export const {
  useGetGuestsQuery,
  useGetGuestByIdQuery,
  useGetGuestByPhoneQuery,
  useGetImageQuery,
  useCreateGuestMutation,
  useUpdateGuestMutation,
  useDeleteGuestMutation,
} = guestApi;

export default guestApi;
