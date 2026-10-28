import { hotelApi } from "../baseQuery";
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

const mapBackendExpense = (item: any): HotelExpense => ({
  id: String(item.id),
  title: item.title,
  category: item.category,
  amount: Number(item.amount) || 0,
  paymentMode: item.paymentMode,
  date: item.expenseDate || (item.createdDate ? item.createdDate.slice(0, 10) : new Date().toISOString().slice(0, 10)),
  paidTo: item.paidTo ?? undefined,
  notes: item.notes ?? undefined,
  createdAt: item.createdDate || new Date().toISOString(),
});

const expenseApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<HotelExpense[], void>({
      query: () => "/expense",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendExpense).sort((a: HotelExpense, b: HotelExpense) =>
          b.date.localeCompare(a.date)
        );
      },
      providesTags: ["Expense"],
    }),

    createExpense: builder.mutation<HotelExpense, CreateExpensePayload>({
      query: (payload) => ({
        url: "/expense",
        method: "POST",
        body: {
          title: payload.title.trim(),
          category: payload.category,
          amount: Number(payload.amount),
          paymentMode: payload.paymentMode,
          expenseDate: payload.date,
          paidTo: payload.paidTo?.trim() || null,
          notes: payload.notes?.trim() || null,
        },
      }),
      transformResponse: (res: any) => mapBackendExpense(res?.data ?? res),
      invalidatesTags: ["Expense", "Report"],
    }),

    deleteExpense: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/expense/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["Expense", "Report"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApi;

export default expenseApi;
