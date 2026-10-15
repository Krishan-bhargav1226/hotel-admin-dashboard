import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MdAdd, MdRestaurant, MdRoomService } from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { Button as UiButton } from "../../components/ui/button";
import OrderDialog from "./components/OrderDialog";
import MenuItemDialog from "./components/MenuItemDialog";
import ServiceOrdersPanel from "./components/ServiceOrdersPanel";
import MenuCatalogPanel from "./components/MenuCatalogPanel";
import {
  useCreateServiceOrderMutation,
  useDeleteMenuItemMutation,
  useGetMenuItemsQuery,
  useGetServiceOrdersQuery,
  useSaveMenuItemMutation,
  useUpdateServiceOrderStatusMutation,
} from "../../store/services/pos/posSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { getErrorMessage } from "../../utils/helper/helper";
import type { MenuCategory, MenuItem as IMenuItem, PaymentMode, ServiceOrder, ServiceOrderItem } from "../../utils/interfaces/Interface";

export default function POSServices() {
  const { data: menuItems = [] } = useGetMenuItemsQuery();
  const { data: orders = [] } = useGetServiceOrdersQuery();
  const { data: stays = [] } = useGetStaysQuery();
  const [createOrder, { isLoading: isOrdering }] = useCreateServiceOrderMutation();
  const [updateOrderStatus] = useUpdateServiceOrderStatusMutation();
  const [saveMenuItem, { isLoading: isSavingMenu }] = useSaveMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [menuFilterCat, setMenuFilterCat] = useState("ALL");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [orderCart, setOrderCart] = useState<Record<string, number>>({});
  const [billedToRoom, setBilledToRoom] = useState(true);
  const [directPaymentMode, setDirectPaymentMode] = useState<PaymentMode>("UPI");
  const [orderNotes, setOrderNotes] = useState("");
  const [editingItem, setEditingItem] = useState<Partial<IMenuItem>>({ name: "", category: "MAIN_COURSE", price: 250, isAvailable: true, description: "" });

  const activeStays = useMemo(() => stays.filter((stay) => stay.status === "ACTIVE"), [stays]);
  const cartItemsList: ServiceOrderItem[] = useMemo(() => Object.entries(orderCart)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => {
      const item = menuItems.find((menuItem) => menuItem.id === id);
      return { menuItemId: id, name: item?.name || "Item", price: item?.price || 0, quantity };
    }), [orderCart, menuItems]);
  const cartSubtotal = cartItemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + cartTax;

  const updateCartQty = (id: string, delta: number) => setOrderCart((current) => {
    const next = Math.max(0, (current[id] || 0) + delta);
    if (!next) {
      const updated = { ...current };
      delete updated[id];
      return updated;
    }
    return { ...current, [id]: next };
  });

  const handleOrderSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRoomId) return toast.error("Please select a destination room");
    if (!cartItemsList.length) return toast.error("Cart is empty! Please add at least 1 item");
    try {
      const targetStay = activeStays.find((stay) => stay.roomId === selectedRoomId);
      await createOrder({ roomId: selectedRoomId, stayId: targetStay?.id, items: cartItemsList, billedToRoom, paymentMode: billedToRoom ? undefined : directPaymentMode, notes: orderNotes }).unwrap();
      toast.success(billedToRoom ? "Order placed & charged to Guest Room Folio!" : "Order placed & direct payment received!");
      setOpenOrderModal(false);
      setOrderCart({});
      setOrderNotes("");
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleSaveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem.name || !editingItem.price) return toast.error("Please provide item name and price");
    try {
      await saveMenuItem({ ...editingItem, name: editingItem.name, price: Number(editingItem.price), category: editingItem.category as MenuCategory }).unwrap();
      toast.success("Menu item saved successfully");
      setOpenItemModal(false);
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleMarkDelivered = async (order: ServiceOrder) => {
    await updateOrderStatus({ id: order.id, status: "DELIVERED" });
    toast.success(`Order ${order.orderNo} marked as Delivered!`);
  };

  const handleDeleteMenuItem = async (item: IMenuItem) => {
    if (!confirm(`Remove "${item.name}" from menu?`)) return;
    await deleteMenuItem(item.id);
    toast.success("Item removed");
  };

  const openNewOrder = () => {
    if (activeStays.length && !selectedRoomId) setSelectedRoomId(activeStays[0].roomId);
    setOpenOrderModal(true);
  };

  const openNewMenuItem = () => {
    setEditingItem({ name: "", category: "MAIN_COURSE", price: 250, isAvailable: true, description: "" });
    setOpenItemModal(true);
  };

  return (
    <MainContainer>
      <PageTitle title="Room service" subtitle="Manage open guest orders and your service menu." actions={
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Room service views" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <TabButton id="orders-tab" panel="orders-panel" active={activeTab === 0} onClick={() => setActiveTab(0)} icon={<MdRoomService size={16} />} label={`Orders (${orders.filter((order) => order.status !== "DELIVERED").length})`} />
            <TabButton id="menu-tab" panel="menu-panel" active={activeTab === 1} onClick={() => setActiveTab(1)} icon={<MdRestaurant size={16} />} label={`Menu (${menuItems.length})`} />
          </div>
          <UiButton size="sm" onClick={activeTab === 0 ? openNewOrder : openNewMenuItem}><MdAdd size={16} />{activeTab === 0 ? "New order" : "Add menu item"}</UiButton>
        </div>
      } />
      {activeTab === 0 ? <ServiceOrdersPanel orders={orders} onCreateOrder={openNewOrder} onMarkDelivered={handleMarkDelivered} /> : <MenuCatalogPanel items={menuItems} filter={menuFilterCat} setFilter={setMenuFilterCat} search={menuSearchQuery} setSearch={setMenuSearchQuery} onEdit={(item) => { setEditingItem(item); setOpenItemModal(true); }} onDelete={handleDeleteMenuItem} />}
      <OrderDialog open={openOrderModal} onClose={() => setOpenOrderModal(false)} onSubmit={handleOrderSubmit} activeStays={activeStays} menuItems={menuItems} selectedRoomId={selectedRoomId} onRoomChange={setSelectedRoomId} orderCart={orderCart} updateCartQty={updateCartQty} cartItemsList={cartItemsList} cartSubtotal={cartSubtotal} cartTax={cartTax} cartTotal={cartTotal} billedToRoom={billedToRoom} onBillingChange={setBilledToRoom} directPaymentMode={directPaymentMode} onPaymentModeChange={setDirectPaymentMode} orderNotes={orderNotes} onNotesChange={setOrderNotes} isOrdering={isOrdering} />
      <MenuItemDialog open={openItemModal} onClose={() => setOpenItemModal(false)} onSubmit={handleSaveItem} item={editingItem} setItem={setEditingItem} isSaving={isSavingMenu} />
    </MainContainer>
  );
}

function TabButton({ id, panel, active, onClick, icon, label }: { id: string; panel: string; active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button id={id} type="button" role="tab" aria-selected={active} aria-controls={panel} onClick={onClick} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${active ? "bg-white text-slate-900 shadow-sm dark:bg-[var(--card)] dark:text-slate-100" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>{icon}<span>{label}</span></button>;
}
