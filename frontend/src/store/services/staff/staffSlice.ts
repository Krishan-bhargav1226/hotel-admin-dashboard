import { hotelApi } from "../baseQuery";
import type { ShiftRegister, StaffMember } from "../../../utils/interfaces/Interface";

export interface CreateShiftRegisterPayload {
  shiftDate: string;
  shiftType: ShiftRegister["shiftType"];
  staffName: string;
  openingCash: number;
  cashCollected: number;
  pettyExpensesPaid: number;
  actualCashCounted: number;
  handoverNotes: string;
}

const mapBackendStaff = (item: any): StaffMember => ({
  id: String(item.id),
  name: item.name,
  role: item.role,
  phone: item.phone,
  email: item.email ?? undefined,
  shift: item.shift || "FULL_DAY",
  status: item.dutyStatus || "ON_DUTY",
  joinedDate: item.joinedDate || (item.createdDate ? item.createdDate.slice(0, 10) : "2024-01-01"),
  propertyId: item.propertyId ? String(item.propertyId) : undefined,
  propertyName: item.propertyName ?? undefined,
});

const staffApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<StaffMember[], void>({
      query: () => "/staff",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendStaff);
      },
      providesTags: ["Staff"],
    }),

    saveStaffMember: builder.mutation<
      StaffMember,
      Partial<StaffMember> & { name: string; role: StaffMember["role"]; phone: string }
    >({
      query: (payload) => {
        if (payload.id) {
          return {
            url: `/staff/${payload.id}`,
            method: "PUT",
            body: {
              name: payload.name.trim(),
              role: payload.role,
              phone: payload.phone.trim(),
              email: payload.email || null,
              shift: payload.shift || "FULL_DAY",
              dutyStatus: payload.status || "ON_DUTY",
              joinedDate: payload.joinedDate || new Date().toISOString().slice(0, 10),
              propertyId: payload.propertyId ? Number(payload.propertyId) : null,
            },
          };
        } else {
          return {
            url: "/staff",
            method: "POST",
            body: {
              name: payload.name.trim(),
              role: payload.role,
              phone: payload.phone.trim(),
              email: payload.email || null,
              shift: payload.shift || "FULL_DAY",
              dutyStatus: payload.status || "ON_DUTY",
              joinedDate: payload.joinedDate || new Date().toISOString().slice(0, 10),
              propertyId: payload.propertyId ? Number(payload.propertyId) : null,
            },
          };
        }
      },
      transformResponse: (res: any) => mapBackendStaff(res?.data ?? res),
      invalidatesTags: ["Staff"],
    }),

    deleteStaffMember: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["Staff"],
    }),

    toggleStaffDuty: builder.mutation<void, { id: string; status: StaffMember["status"] }>({
      query: ({ id, status }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body: { dutyStatus: status },
      }),
      invalidatesTags: ["Staff"],
    }),

    getShiftRegisters: builder.query<ShiftRegister[], void>({
      query: () => "/shift",
      transformResponse: (response: any): ShiftRegister[] => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map((item: any) => {
          const opening = Number(item.openingCash) || 5000;
          const collected = Number(item.cashCollected) || 0;
          const expenses = Number(item.pettyExpensesPaid) || 0;
          const closingExpected = Number(item.closingCashExpected ?? (opening + collected - expenses));
          const counted = Number(item.actualCashCounted) || closingExpected;
          const difference = Number(item.cashDifference ?? (counted - closingExpected));
          return {
            id: String(item.id),
            shiftDate: item.shiftDate || new Date().toISOString().slice(0, 10),
            shiftType: item.shiftType || "MORNING",
            staffName: item.staffName || "Staff Member",
            openingCash: opening,
            cashCollected: collected,
            pettyExpensesPaid: expenses,
            closingCashExpected: closingExpected,
            actualCashCounted: counted,
            cashDifference: difference,
            handoverNotes: item.handoverNotes || "",
            createdAt: item.createdDate || new Date().toISOString(),
          };
        });
      },
      providesTags: ["Shift"],
    }),

    createShiftRegister: builder.mutation<ShiftRegister, CreateShiftRegisterPayload>({
      query: (payload) => ({
        url: "/shift",
        method: "POST",
        body: payload,
      }),
      transformResponse: (_res: any, _meta: any, arg: CreateShiftRegisterPayload): ShiftRegister => {
        const closing = arg.openingCash + arg.cashCollected - arg.pettyExpensesPaid;
        const diff = arg.actualCashCounted - closing;
        return {
          id: `sr-${Date.now()}`,
          shiftDate: arg.shiftDate,
          shiftType: arg.shiftType,
          staffName: arg.staffName,
          openingCash: arg.openingCash,
          cashCollected: arg.cashCollected,
          pettyExpensesPaid: arg.pettyExpensesPaid,
          closingCashExpected: closing,
          actualCashCounted: arg.actualCashCounted,
          cashDifference: diff,
          handoverNotes: arg.handoverNotes,
          createdAt: new Date().toISOString(),
        };
      },
      invalidatesTags: ["Shift"],
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useSaveStaffMemberMutation,
  useDeleteStaffMemberMutation,
  useToggleStaffDutyMutation,
  useGetShiftRegistersQuery,
  useCreateShiftRegisterMutation,
} = staffApi;

export default staffApi;
