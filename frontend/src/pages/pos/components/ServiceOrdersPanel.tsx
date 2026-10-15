import { MdAdd, MdCheckCircle, MdFastfood } from "react-icons/md";
import { formatCurrency } from "../../../utils/helper/helper";
import type { ServiceOrder } from "../../../utils/interfaces/Interface";

interface ServiceOrdersPanelProps {
  orders: ServiceOrder[];
  onCreateOrder: () => void;
  onMarkDelivered: (order: ServiceOrder) => void;
}

export default function ServiceOrdersPanel({ orders, onCreateOrder, onMarkDelivered }: ServiceOrdersPanelProps) {
  return (
    <div id="orders-panel" role="tabpanel" aria-labelledby="orders-tab">
      {orders.length === 0 ? <EmptyOrders onCreateOrder={onCreateOrder} /> : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => <ServiceOrderCard key={order.id} order={order} onMarkDelivered={() => onMarkDelivered(order)} />)}
        </div>
      )}
    </div>
  );
}

function EmptyOrders({ onCreateOrder }: { onCreateOrder: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><MdFastfood size={24} /></div>
      <h3 className="text-sm font-bold text-slate-800">No active room service orders</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">Orders sent to guest rooms (meals, drinks, extra amenities, laundry) will appear here in real time.</p>
      <button type="button" onClick={onCreateOrder} className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-800"><MdAdd size={15} /><span>Create First Room Order</span></button>
    </div>
  );
}

function ServiceOrderCard({ order, onMarkDelivered }: { order: ServiceOrder; onMarkDelivered: () => void }) {
  const delivered = order.status === "DELIVERED";

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-400">{order.orderNo}</span>
          <OrderStatus delivered={delivered} />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-b border-slate-100 pb-2.5">
          <span className="text-base font-bold text-slate-900">Room {order.roomNumber}</span>
          <span className="max-w-[140px] truncate text-xs font-medium text-slate-500">{order.guestName}</span>
        </div>
        <div className="mt-3 divide-y divide-slate-50 text-xs">
          {order.items.map((item, index) => <div key={`${item.menuItemId}-${index}`} className="flex items-center justify-between pt-1.5 first:pt-0">
            <div className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 font-mono text-[11px] font-semibold text-slate-500">{item.quantity}</span><span className="font-medium text-slate-800">{item.name}</span></div>
            <span className="font-mono font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
          </div>)}
        </div>
        {order.notes && <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/70 p-2 text-[11px] font-medium text-amber-900"><strong className="font-bold">Instructions:</strong> "{order.notes}"</div>}
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-medium text-slate-400">{order.billedToRoom ? "Charged to Room Folio" : `Paid (${order.paymentMode})`}</span><span className="font-mono text-base font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span></div>
        {delivered ? <div className="py-1 text-center text-[11px] font-medium text-slate-400">Order Settled & Closed</div> : <button type="button" onClick={onMarkDelivered} className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-emerald-700 active:scale-[0.98]"><MdCheckCircle size={15} /><span>Mark Delivered & Served</span></button>}
      </div>
    </article>
  );
}

function OrderStatus({ delivered }: { delivered: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${delivered ? "border-emerald-200/60 bg-emerald-50 text-emerald-800" : "border-amber-200/60 bg-amber-50 text-amber-800"}`}><span className={`h-1.5 w-1.5 rounded-full ${delivered ? "bg-emerald-500" : "animate-pulse bg-amber-500"}`} />{delivered ? "Delivered" : "In Kitchen"}</span>;
}
