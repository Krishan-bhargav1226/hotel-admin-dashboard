import { hotelApi } from "../baseQuery";
import type {
  MenuItem,
  PaymentMode,
  ServiceOrder,
  ServiceOrderItem,
} from "../../../utils/interfaces/Interface";

export interface CreateServiceOrderPayload {
  roomId: string;
  stayId?: string;
  items: ServiceOrderItem[];
  billedToRoom: boolean;
  paymentMode?: PaymentMode;
  notes?: string;
}

const mapBackendPosItem = (item: any): MenuItem => ({
  id: String(item.id),
  name: item.name,
  category: item.category,
  price: Number(item.price) || 0,
  isAvailable: item.isAvailable !== false,
  description: item.description ?? undefined,
});

const posApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], void>({
      query: () => "/pos/item",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map(mapBackendPosItem);
      },
      providesTags: ["MenuItem"],
    }),

    saveMenuItem: builder.mutation<
      void,
      Partial<MenuItem> & { name: string; price: number; category: MenuItem["category"] }
    >({
      query: (payload) => {
        if (payload.id) {
          return {
            url: `/pos/item/${payload.id}`,
            method: "PUT",
            body: {
              name: payload.name.trim(),
              category: payload.category,
              price: Number(payload.price),
              isAvailable: payload.isAvailable ?? true,
              description: payload.description?.trim() || null,
            },
          };
        } else {
          return {
            url: "/pos/item",
            method: "POST",
            body: {
              name: payload.name.trim(),
              category: payload.category,
              price: Number(payload.price),
              isAvailable: payload.isAvailable ?? true,
              description: payload.description?.trim() || null,
            },
          };
        }
      },
      invalidatesTags: ["MenuItem"],
    }),

    deleteMenuItem: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/pos/item/${id}`,
        method: "DELETE",
      }),
      transformResponse: () => true,
      invalidatesTags: ["MenuItem"],
    }),

    getServiceOrders: builder.query<ServiceOrder[], void>({
      query: () => "/pos/order",
      transformResponse: (response: any) => {
        const rawList = Array.isArray(response) ? response : (response?.data ?? []);
        return rawList.map((item: any) => ({
          id: String(item.id),
          orderNo: item.orderNo || `ORD-${item.id}`,
          roomId: String(item.roomId),
          roomNumber: item.roomNumber || String(item.roomId),
          stayId: item.stayId ? String(item.stayId) : undefined,
          guestName: item.guestName || "Guest",
          items: (item.items || []).map((i: any) => ({
            menuItemId: String(i.menuItemId),
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
          })),
          subtotal: Number(item.subtotal) || 0,
          taxAmount: Number(item.taxAmount) || 0,
          totalAmount: Number(item.totalAmount) || 0,
          status: item.status || "PENDING",
          billedToRoom: Boolean(item.billedToRoom),
          paymentMode: item.paymentMode ?? undefined,
          notes: item.notes ?? undefined,
          createdAt: item.createdDate || new Date().toISOString(),
        }));
      },
      providesTags: ["ServiceOrder"],
    }),

    createServiceOrder: builder.mutation<ServiceOrder, CreateServiceOrderPayload>({
      query: (payload) => ({
        url: "/pos/order",
        method: "POST",
        body: {
          roomId: Number(payload.roomId),
          stayId: payload.stayId ? Number(payload.stayId) : null,
          items: payload.items.map((i) => ({
            menuItemId: Number(i.menuItemId),
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
          })),
          billedToRoom: payload.billedToRoom,
          paymentMode: payload.paymentMode,
          notes: payload.notes?.trim() || null,
        },
      }),
      transformResponse: (res: unknown, _meta: unknown, arg: CreateServiceOrderPayload): ServiceOrder => {
        const subtotal = arg.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return {
          id: String(typeof res === "number" ? res : Date.now()),
          orderNo: `ORD-${Date.now().toString().slice(-4)}`,
          roomId: arg.roomId,
          roomNumber: arg.roomId,
          stayId: arg.stayId,
          guestName: "In-House Guest",
          items: arg.items,
          subtotal,
          taxAmount: Math.round(subtotal * 0.05),
          totalAmount: Math.round(subtotal * 1.05),
          status: "PENDING",
          billedToRoom: arg.billedToRoom,
          paymentMode: arg.paymentMode,
          notes: arg.notes,
          createdAt: new Date().toISOString(),
        };
      },
      invalidatesTags: ["ServiceOrder", "Stay", "Report"],
    }),

    updateServiceOrderStatus: builder.mutation<
      void,
      { id: string; status: ServiceOrder["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/pos/order/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["ServiceOrder", "Stay", "Report"],
    }),

    deleteServiceOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pos/order/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceOrder", "Stay", "Report"],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useSaveMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetServiceOrdersQuery,
  useCreateServiceOrderMutation,
  useUpdateServiceOrderStatusMutation,
  useDeleteServiceOrderMutation,
} = posApi;

export default posApi;
