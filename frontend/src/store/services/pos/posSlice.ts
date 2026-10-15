import { hotelApi, run } from "../baseQuery";
import {
  DbKeys,
  readList,
  runExclusive,
  writeList,
} from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type {
  ExtraCharge,
  MenuItem,
  PaymentMode,
  Room,
  ServiceOrder,
  ServiceOrderItem,
  Stay,
} from "../../../utils/interfaces/Interface";

export interface CreateServiceOrderPayload {
  roomId: string;
  stayId?: string;
  items: ServiceOrderItem[];
  billedToRoom: boolean;
  paymentMode?: PaymentMode;
  notes?: string;
}

const posApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query<MenuItem[], void>({
      queryFn: () =>
        run(async () => {
          const items = await readList<MenuItem>(DbKeys.MENU_ITEMS);
          return items;
        }),
      providesTags: ["MenuItem"],
    }),

    saveMenuItem: builder.mutation<MenuItem, Partial<MenuItem> & { name: string; price: number; category: MenuItem["category"] }>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const items = await readList<MenuItem>(DbKeys.MENU_ITEMS);
            if (payload.id) {
              const target = items.find((i) => i.id === payload.id);
              if (!target) throw new Error("Item not found");
              Object.assign(target, payload);
              await writeList(DbKeys.MENU_ITEMS, items);
              return target;
            } else {
              const newItem: MenuItem = {
                id: uid(),
                name: payload.name.trim(),
                category: payload.category,
                price: Number(payload.price),
                isAvailable: payload.isAvailable ?? true,
                description: payload.description?.trim(),
              };
              items.push(newItem);
              await writeList(DbKeys.MENU_ITEMS, items);
              return newItem;
            }
          })
        ),
      invalidatesTags: ["MenuItem"],
    }),

    deleteMenuItem: builder.mutation<void, string>({
      queryFn: (id) =>
        run(() =>
          runExclusive(async () => {
            const items = await readList<MenuItem>(DbKeys.MENU_ITEMS);
            await writeList(
              DbKeys.MENU_ITEMS,
              items.filter((i) => i.id !== id)
            );
          })
        ),
      invalidatesTags: ["MenuItem"],
    }),

    getServiceOrders: builder.query<ServiceOrder[], void>({
      queryFn: () =>
        run(async () => {
          const orders = await readList<ServiceOrder>(DbKeys.SERVICE_ORDERS);
          return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }),
      providesTags: ["ServiceOrder"],
    }),

    createServiceOrder: builder.mutation<ServiceOrder, CreateServiceOrderPayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const orders = await readList<ServiceOrder>(DbKeys.SERVICE_ORDERS);
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const room = rooms.find((r) => r.id === payload.roomId);
            if (!room) throw new Error("Room not found");

            const stays = await readList<Stay>(DbKeys.STAYS);
            const activeStay = stays.find((s) => s.roomId === payload.roomId && s.status === "ACTIVE");

            const subtotal = payload.items.reduce((s, it) => s + it.price * it.quantity, 0);
            const taxAmount = Math.round(subtotal * 0.05); // 5% F&B GST
            const totalAmount = subtotal + taxAmount;
            const now = new Date().toISOString();
            const orderNo = `ORD-${String(orders.length + 1).padStart(4, "0")}`;

            const order: ServiceOrder = {
              id: uid(),
              orderNo,
              roomId: room.id,
              roomNumber: room.number,
              stayId: activeStay?.id,
              guestName: activeStay?.guestName || "Walk-in Guest",
              items: payload.items,
              subtotal,
              taxAmount,
              totalAmount,
              billedToRoom: payload.billedToRoom,
              paymentMode: payload.billedToRoom ? undefined : payload.paymentMode || "CASH",
              status: "PREPARING",
              notes: payload.notes,
              createdAt: now,
            };

            // If billed to room and there is an active stay, append to extraCharges
            if (payload.billedToRoom && activeStay) {
              const summary = payload.items.map((it) => `${it.quantity}x ${it.name}`).join(", ");
              const extra: ExtraCharge = {
                id: uid(),
                label: `Room Service (${orderNo}: ${summary.slice(0, 35)}...)`,
                amount: totalAmount,
              };
              activeStay.extraCharges = [...activeStay.extraCharges, extra];
              activeStay.updatedAt = now;
              await writeList(DbKeys.STAYS, stays);
            }

            await writeList(DbKeys.SERVICE_ORDERS, [order, ...orders]);
            return order;
          })
        ),
      invalidatesTags: ["ServiceOrder", "Stay"],
    }),

    updateServiceOrderStatus: builder.mutation<
      ServiceOrder,
      { id: string; status: ServiceOrder["status"] }
    >({
      queryFn: ({ id, status }) =>
        run(() =>
          runExclusive(async () => {
            const orders = await readList<ServiceOrder>(DbKeys.SERVICE_ORDERS);
            const order = orders.find((o) => o.id === id);
            if (!order) throw new Error("Order not found");

            order.status = status;
            await writeList(DbKeys.SERVICE_ORDERS, orders);
            return order;
          })
        ),
      invalidatesTags: ["ServiceOrder"],
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
} = posApi;
