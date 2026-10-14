import { hotelApi, run } from "../baseQuery";
import {
  DbKeys,
  readList,
  runExclusive,
  writeList,
} from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
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

const staffApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<StaffMember[], void>({
      queryFn: () =>
        run(async () => {
          const list = await readList<StaffMember>(DbKeys.STAFF);
          return list;
        }),
      providesTags: ["Staff"],
    }),

    saveStaffMember: builder.mutation<StaffMember, Partial<StaffMember> & { name: string; role: StaffMember["role"]; phone: string }>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<StaffMember>(DbKeys.STAFF);
            if (payload.id) {
              const target = list.find((s) => s.id === payload.id);
              if (!target) throw new Error("Staff member not found");
              Object.assign(target, payload);
              await writeList(DbKeys.STAFF, list);
              return target;
            } else {
              const newStaff: StaffMember = {
                id: uid(),
                name: payload.name.trim(),
                role: payload.role,
                phone: payload.phone.trim(),
                shift: payload.shift || "FULL_DAY",
                status: payload.status || "ON_DUTY",
                joinedDate: payload.joinedDate || new Date().toISOString().split("T")[0],
              };
              list.push(newStaff);
              await writeList(DbKeys.STAFF, list);
              return newStaff;
            }
          })
        ),
      invalidatesTags: ["Staff"],
    }),

    deleteStaffMember: builder.mutation<void, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<StaffMember>(DbKeys.STAFF);
            await writeList(
              DbKeys.STAFF,
              list.filter((s) => s.id !== id)
            );
          })
        ),
      invalidatesTags: ["Staff"],
    }),

    getShiftRegisters: builder.query<ShiftRegister[], void>({
      queryFn: () =>
        run(async () => {
          const list = await readList<ShiftRegister>(DbKeys.SHIFTS);
          return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }),
      providesTags: ["Shift"],
    }),

    createShiftRegister: builder.mutation<ShiftRegister, CreateShiftRegisterPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<ShiftRegister>(DbKeys.SHIFTS);
            const closingCashExpected =
              payload.openingCash + payload.cashCollected - payload.pettyExpensesPaid;
            const cashDifference = payload.actualCashCounted - closingCashExpected;

            const shift: ShiftRegister = {
              id: uid(),
              shiftDate: payload.shiftDate,
              shiftType: payload.shiftType,
              staffName: payload.staffName.trim(),
              openingCash: payload.openingCash,
              cashCollected: payload.cashCollected,
              pettyExpensesPaid: payload.pettyExpensesPaid,
              closingCashExpected,
              actualCashCounted: payload.actualCashCounted,
              cashDifference,
              handoverNotes: payload.handoverNotes.trim(),
              createdAt: new Date().toISOString(),
            };

            await writeList(DbKeys.SHIFTS, [shift, ...list]);
            return shift;
          })
        ),
      invalidatesTags: ["Shift"],
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useSaveStaffMemberMutation,
  useDeleteStaffMemberMutation,
  useGetShiftRegistersQuery,
  useCreateShiftRegisterMutation,
} = staffApi;
