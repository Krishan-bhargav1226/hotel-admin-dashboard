import { hotelApi, run } from "../baseQuery";
import {
  DbKeys,
  readList,
  runExclusive,
  writeList,
} from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type { HotelExpense } from "../../../utils/interfaces/Interface";

export interface CreateExpensePayload {
  title: string;
  category: HotelExpense["category"];
  amount: number;
  paymentMode: HotelExpense["paymentMode"];
  date: string;
  paidTo?: string;
  notes?: string;
}

const expenseApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<HotelExpense[], void>({
      queryFn: () =>
        run(async () => {
          const list = await readList<HotelExpense>(DbKeys.EXPENSES);
          return list.sort((a, b) => b.date.localeCompare(a.date));
        }),
      providesTags: ["Expense"],
    }),

    createExpense: builder.mutation<HotelExpense, CreateExpensePayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<HotelExpense>(DbKeys.EXPENSES);
            const now = new Date().toISOString();

            const expense: HotelExpense = {
              id: uid(),
              title: payload.title.trim(),
              category: payload.category,
              amount: Number(payload.amount),
              paymentMode: payload.paymentMode,
              date: payload.date,
              paidTo: payload.paidTo?.trim(),
              notes: payload.notes?.trim(),
              createdAt: now,
            };

            await writeList(DbKeys.EXPENSES, [expense, ...list]);
            return expense;
          })
        ),
      invalidatesTags: ["Expense"],
    }),

    deleteExpense: builder.mutation<void, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const list = await readList<HotelExpense>(DbKeys.EXPENSES);
            await writeList(
              DbKeys.EXPENSES,
              list.filter((e) => e.id !== id)
            );
          })
        ),
      invalidatesTags: ["Expense"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;
