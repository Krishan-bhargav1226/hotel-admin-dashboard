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

const STAFF_ROLES = ["", "SUPER_ADMIN", "ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "CHEF", "MAINTENANCE"];
const SHIFT_TYPES = ["", "MORNING", "EVENING", "NIGHT", "FULL_DAY"];
const DUTY_STATUSES = ["", "ON_DUTY", "OFF_DUTY"];

const asEnum = (value: unknown, names: string[], fallback: string) => {
  if (typeof value === "string" && names.includes(value)) return value;
  const index = Number(value);
  return Number.isInteger(index) ? names[index] || fallback : fallback;
};

const staffPhone = (phone: string) => {
  const trimmed = phone.trim();
  if (trimmed.length <= 20) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return (digits.length > 10 ? digits.slice(-10) : digits).slice(0, 20);
};

const dateOnly = (value: unknown) => {
  const text = String(value ?? "").trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(text);
  return match?.[1] || new Date().toISOString().slice(0, 10);
};

const finite = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const mapBackendStaff = (item: any): StaffMember => ({
  id: String(item.id),
  name: item.name,
  role: asEnum(item.role, STAFF_ROLES, "RECEPTIONIST") as StaffMember["role"],
  phone: item.phone,
  email: item.email ?? undefined,
  shift: asEnum(item.shift, SHIFT_TYPES, "FULL_DAY") as StaffMember["shift"],
  status: asEnum(item.dutyStatus, DUTY_STATUSES, "OFF_DUTY") as StaffMember["status"],
  joinedDate: dateOnly(item.joinedDate || item.createdDate),
  propertyId: item.propertyId ? String(item.propertyId) : undefined,
  propertyName: item.propertyName ?? undefined,
});

const staffBody = (payload: Partial<StaffMember> & { name: string; role: StaffMember["role"]; phone: string }) => {
  const propertyId = Number(payload.propertyId);
  return {
    name: payload.name.trim().slice(0, 150),
    role: payload.role,
    phone: staffPhone(payload.phone),
    email: payload.email?.trim() ? payload.email.trim().slice(0, 150) : null,
    shift: payload.shift || "FULL_DAY",
    dutyStatus: payload.status || "ON_DUTY",
    joinedDate: dateOnly(payload.joinedDate),
    propertyId: Number.isInteger(propertyId) && propertyId > 0 ? propertyId : null,
  };
};

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
      query: (payload) => ({
        url: payload.id ? `/staff/${payload.id}` : "/staff",
        method: payload.id ? "PUT" : "POST",
        body: staffBody(payload),
      }),
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
          const opening = finite(item.openingCash);
          const collected = finite(item.cashCollected);
          const expenses = finite(item.pettyExpensesPaid);
          const closingExpected = item.closingCashExpected == null ? opening + collected - expenses : finite(item.closingCashExpected);
          const counted = item.actualCashCounted == null ? closingExpected : finite(item.actualCashCounted);
          const difference = item.cashDifference == null ? counted - closingExpected : finite(item.cashDifference);
          return {
            id: String(item.id),
            shiftDate: dateOnly(item.shiftDate),
            shiftType: asEnum(item.shiftType, SHIFT_TYPES, "MORNING") as ShiftRegister["shiftType"],
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
        body: {
          shiftDate: dateOnly(payload.shiftDate),
          shiftType: payload.shiftType,
          staffName: payload.staffName.trim().slice(0, 150),
          openingCash: finite(payload.openingCash),
          cashCollected: finite(payload.cashCollected),
          pettyExpensesPaid: finite(payload.pettyExpensesPaid),
          actualCashCounted: finite(payload.actualCashCounted),
          handoverNotes: payload.handoverNotes?.trim().slice(0, 1000) || null,
        },
      }),
      transformResponse: (res: any, _meta: any, arg: CreateShiftRegisterPayload): ShiftRegister => {
        const closing = arg.openingCash + arg.cashCollected - arg.pettyExpensesPaid;
        const diff = arg.actualCashCounted - closing;
        const id = typeof res === "number" || typeof res === "string" ? res : res?.id;
        return {
          id: String(id ?? Date.now()),
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
