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

const CATEGORIES = ["", "GROCERY_KITCHEN", "UTILITIES_ELECTRICITY", "LAUNDRY_SUPPLIES", "MAINTENANCE_PARTS", "FUEL_GENERATOR", "STAFF_WELFARE", "OTHER"];
const PAYMENTS = ["", "CASH", "UPI", "CARD"];

const asEnum = (value: unknown, names: string[], fallback: string) => {
  if (typeof value === "string" && names.includes(value)) return value;
  const index = Number(value);
  return Number.isInteger(index) ? names[index] || fallback : fallback;
};

const dateOnly = (value: unknown) => {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value ?? ""));
  return match?.[1] || new Date().toISOString().slice(0, 10);
};

const mapBackendExpense = (item: any): HotelExpense => ({
  id: String(item.id),
  title: item.title,
  category: asEnum(item.category, CATEGORIES, "OTHER") as HotelExpense["category"],
  amount: Number(item.amount) || 0,
  paymentMode: asEnum(item.paymentMode, PAYMENTS, "CASH") as HotelExpense["paymentMode"],
  date: dateOnly(item.expenseDate || item.createdDate),
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
          title: payload.title.trim().slice(0, 150),
          category: payload.category,
          amount: Number(payload.amount),
          paymentMode: payload.paymentMode,
          expenseDate: dateOnly(payload.date),
          paidTo: payload.paidTo?.trim().slice(0, 150) || null,
          notes: payload.notes?.trim().slice(0, 500) || null,
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
