import { useState, useMemo } from "react";
import {
  Button,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import toast from "react-hot-toast";
import {
  MdRestaurant,
  MdRoomService,
  MdAdd,
  MdCheckCircle,
  MdFastfood,
  MdDelete,
  MdEdit,
  MdLocalDining,
  MdCleaningServices,
  MdLocalCafe,
  MdLocalBar,
  MdLocalTaxi,
} from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import UiDialog from "../../components/ui/models/UiDialog";
import {
  useCreateServiceOrderMutation,
  useDeleteMenuItemMutation,
  useGetMenuItemsQuery,
  useGetServiceOrdersQuery,
  useSaveMenuItemMutation,
  useUpdateServiceOrderStatusMutation,
} from "../../store/services/pos/posSlice";
import { useGetStaysQuery } from "../../store/services/stay/staySlice";
import { formatCurrency, getErrorMessage } from "../../utils/helper/helper";
import type {
  MenuCategory,
  MenuItem as IMenuItem,
  PaymentMode,
  ServiceOrderItem,
} from "../../utils/interfaces/Interface";

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  BREAKFAST: "Breakfast",
  MAIN_COURSE: "Main Course & Meals",
  SNACKS: "Snacks & Starters",
  BEVERAGES: "Beverages & Coffee",
  LAUNDRY: "Laundry & Ironing",
  EXTRA_SERVICE: "Amenities & Taxi",
};

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
  const [menuFilterCat, setMenuFilterCat] = useState<string>("ALL");
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  // New Order Form state
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [orderCart, setOrderCart] = useState<Record<string, number>>({});
  const [billedToRoom, setBilledToRoom] = useState(true);
  const [directPaymentMode, setDirectPaymentMode] = useState<PaymentMode>("UPI");
  const [orderNotes, setOrderNotes] = useState("");

  // Edit Menu Item state
  const [editingItem, setEditingItem] = useState<Partial<IMenuItem>>({
    name: "",
    category: "MAIN_COURSE",
    price: 250,
    isAvailable: true,
    description: "",
  });

  const activeStays = useMemo(() => stays.filter((s) => s.status === "ACTIVE"), [stays]);

  const cartItemsList: ServiceOrderItem[] = useMemo(() => {
    return Object.entries(orderCart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menuItems.find((m) => m.id === id);
        return {
          menuItemId: id,
          name: item?.name || "Item",
          price: item?.price || 0,
          quantity: qty,
        };
      });
  }, [orderCart, menuItems]);

  const cartSubtotal = cartItemsList.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + cartTax;

  const updateCartQty = (id: string, delta: number) => {
    setOrderCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.error("Please select a destination room");
      return;
    }
    if (cartItemsList.length === 0) {
      toast.error("Cart is empty! Please add at least 1 item");
      return;
    }

    try {
      const targetStay = activeStays.find((s) => s.roomId === selectedRoomId);
      await createOrder({
        roomId: selectedRoomId,
        stayId: targetStay?.id,
        items: cartItemsList,
        billedToRoom,
        paymentMode: billedToRoom ? undefined : directPaymentMode,
        notes: orderNotes,
      }).unwrap();

      toast.success(
        billedToRoom
          ? "Order placed & charged to Guest Room Folio!"
          : "Order placed & direct payment received!"
      );
      setOpenOrderModal(false);
      setOrderCart({});
      setOrderNotes("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSaveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name || !editingItem.price) {
      toast.error("Please provide item name and price");
      return;
    }
    try {
      await saveMenuItem({
        ...editingItem,
        name: editingItem.name,
        price: Number(editingItem.price),
        category: editingItem.category as MenuCategory,
      }).unwrap();
      toast.success("Menu item saved successfully");
      setOpenItemModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getCategoryIcon = (cat: MenuCategory) => {
    switch (cat) {
      case "BREAKFAST":
        return <MdLocalDining size={14} className="text-amber-600" />;
      case "MAIN_COURSE":
        return <MdRestaurant size={14} className="text-rose-600" />;
      case "SNACKS":
        return <MdFastfood size={14} className="text-orange-600" />;
      case "BEVERAGES":
        return <MdLocalCafe size={14} className="text-sky-600" />;
      case "LAUNDRY":
        return <MdCleaningServices size={14} className="text-indigo-600" />;
      case "EXTRA_SERVICE":
        return <MdLocalTaxi size={14} className="text-emerald-600" />;
      default:
        return <MdLocalBar size={14} className="text-slate-600" />;
    }
  };

  return (
    <MainContainer>
      {/* Editorial Header Section */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-200/70 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-900" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-slate-500">
              F&B Operations · Room Service POS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Room Service & Amenities POS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant guest room food ordering, laundry charging, and digital menu catalog management
          </p>
        </div>

        {/* Top Controls: Segmented Switcher & Primary Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab(0)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 0
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MdRoomService size={15} />
              <span>Active Orders ({orders.filter((o) => o.status !== "DELIVERED").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 1
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MdRestaurant size={15} />
              <span>Menu Catalog ({menuItems.length})</span>
            </button>
          </div>

          {activeTab === 0 ? (
            <button
              type="button"
              onClick={() => {
                if (activeStays.length > 0 && !selectedRoomId) {
                  setSelectedRoomId(activeStays[0].roomId);
                }
                setOpenOrderModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
            >
              <MdAdd size={16} />
              <span>New Room Order</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingItem({
                  name: "",
                  category: "MAIN_COURSE",
                  price: 250,
                  isAvailable: true,
                  description: "",
                });
                setOpenItemModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
            >
              <MdAdd size={16} />
              <span>Add Menu Item</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 0: LIVE KITCHEN & ROOM ORDERS */}
      {activeTab === 0 && (
        <div>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <MdFastfood size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No active room service orders</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Orders sent to guest rooms (meals, drinks, extra amenities, laundry) will appear here in real time.
              </p>
              <button
                type="button"
                onClick={() => setOpenOrderModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <MdAdd size={15} />
                <span>Create First Room Order</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((ord) => {
                const isDelivered = ord.status === "DELIVERED";
                return (
                  <div
                    key={ord.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all"
                  >
                    <div>
                      {/* Top Bar: Order No & Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ord.orderNo}
                        </span>
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            In Kitchen
                          </span>
                        )}
                      </div>

                      {/* Room & Guest */}
                      <div className="mt-3 flex items-baseline justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-bold text-slate-900">
                            Room {ord.roomNumber}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">
                          {ord.guestName}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="mt-3 space-y-1.5 text-xs divide-y divide-slate-50">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 w-5 h-5 rounded flex items-center justify-center">
                                {it.quantity}
                              </span>
                              <span className="text-slate-800 font-medium">{it.name}</span>
                            </div>
                            <span className="font-mono font-semibold text-slate-900">
                              {formatCurrency(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Chef / Delivery Notes */}
                      {ord.notes && (
                        <div className="mt-3 rounded-lg bg-amber-50/70 border border-amber-100 p-2 text-[11px] text-amber-900 font-medium">
                          <strong className="font-bold">Instructions:</strong> "{ord.notes}"
                        </div>
                      )}
                    </div>

                    {/* Footer: Folio vs Direct & Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-medium text-slate-400">
                          {ord.billedToRoom ? "Charged to Room Folio" : `Paid (${ord.paymentMode})`}
                        </span>
                        <span className="font-mono text-base font-bold text-slate-900">
                          {formatCurrency(ord.totalAmount)}
                        </span>
                      </div>

                      {!isDelivered ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await updateOrderStatus({ id: ord.id, status: "DELIVERED" });
                            toast.success(`Order ${ord.orderNo} marked as Delivered!`);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <MdCheckCircle size={15} />
                          <span>Mark Delivered & Served</span>
                        </button>
                      ) : (
                        <div className="text-center py-1 text-[11px] font-medium text-slate-400">
                          Order Settled & Closed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: MENU CATALOG & AMENITIES */}
      {activeTab === 1 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "BREAKFAST", "MAIN_COURSE", "SNACKS", "BEVERAGES", "LAUNDRY", "EXTRA_SERVICE"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMenuFilterCat(cat)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    menuFilterCat === cat
                      ? "bg-slate-900 text-white shadow-2xs font-bold"
                      : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {cat === "ALL" ? "All Items" : CATEGORY_LABELS[cat as MenuCategory]}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search dishes or services..."
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-full sm:w-56"
            />
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {menuItems
              .filter((m) => menuFilterCat === "ALL" || m.category === menuFilterCat)
              .filter((m) => !menuSearchQuery || m.name.toLowerCase().includes(menuSearchQuery.toLowerCase()))
              .map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h4>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-semibold ${
                        item.isAvailable ? "text-emerald-700" : "text-rose-500"
                      }`}
                    >
                      {item.isAvailable ? "● In Stock" : "○ Sold Out"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setOpenItemModal(true);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-all cursor-pointer"
                        title="Edit Item"
                      >
                        <MdEdit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Remove "${item.name}" from menu?`)) {
                            await deleteMenuItem(item.id);
                            toast.success("Item removed");
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        title="Delete Item"
                      >
                        <MdDelete size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* NEW ORDER POS MODAL */}
      <UiDialog
        open={openOrderModal}
        onClose={() => setOpenOrderModal(false)}
        title="New Room Service & Amenity Order"
        maxWidth="md"
      >
        <form onSubmit={handleOrderSubmit} className="space-y-4 pt-1">
          {/* Destination Room */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Destination Guest Room (In-House Stays)
            </label>
            <FormControl fullWidth size="small" required>
              <InputLabel>Select Occupied Room</InputLabel>
              <Select
                value={selectedRoomId}
                label="Select Occupied Room"
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                {activeStays.length === 0 ? (
                  <MenuItem value="" disabled>No active stays in hotel</MenuItem>
                ) : (
                  activeStays.map((s) => (
                    <MenuItem key={s.roomId} value={s.roomId}>
                      Room {s.roomNumber} · {s.guestName} ({s.roomTypeName})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>

          {/* Quick Item Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Menu & Amenities Catalog
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {menuItems.length} items available
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-2">
              {menuItems.map((item) => {
                const qty = orderCart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200/90 bg-white p-2.5 shadow-2xs"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {CATEGORY_LABELS[item.category]} · {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, -1)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.95] disabled:opacity-30 cursor-pointer flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-xs text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 active:scale-[0.95] cursor-pointer flex items-center justify-center transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary & Billing Options */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <div className="text-slate-500">
                Cart Items: <strong className="text-slate-800">{cartItemsList.length} items selected</strong>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Subtotal: {formatCurrency(cartSubtotal)} + 5% GST: {formatCurrency(cartTax)}
              </div>
              <div className="text-base font-bold text-slate-900 mt-1 font-mono">
                Total Bill: {formatCurrency(cartTotal)}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-semibold text-slate-700">Billing Method:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBilledToRoom(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    billedToRoom
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Charge to Room Folio
                </button>
                <button
                  type="button"
                  onClick={() => setBilledToRoom(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    !billedToRoom
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Direct Payment
                </button>
              </div>

              {!billedToRoom && (
                <div className="flex items-center gap-1 mt-1">
                  {(["UPI", "CASH", "CARD"] as PaymentMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDirectPaymentMode(mode)}
                      className={`flex-1 py-1 px-2 text-[10px] font-semibold rounded border transition-all cursor-pointer ${
                        directPaymentMode === mode
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <TextField
            label="Chef / Kitchen Delivery Instructions"
            fullWidth
            size="small"
            placeholder="e.g. Extra spicy, serve with hot water, deliver to room immediately"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />

          <DialogActions className="!px-0 !pt-2">
            <Button onClick={() => setOpenOrderModal(false)} color="inherit" sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <UISubmitButton
              type="submit"
              text={`Confirm & Dispatch Order (${formatCurrency(cartTotal)})`}
              loading={isOrdering}
              disabled={cartItemsList.length === 0}
            />
          </DialogActions>
        </form>
      </UiDialog>

      {/* EDIT MENU ITEM MODAL */}
      <UiDialog
        open={openItemModal}
        onClose={() => setOpenItemModal(false)}
        title="Setup Menu / Amenity Item"
        maxWidth="xs"
      >
        <form onSubmit={handleSaveItemSubmit} className="space-y-4 pt-1">
          <TextField
            label="Item / Service Name *"
            required
            fullWidth
            size="small"
            value={editingItem.name || ""}
            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={editingItem.category || "MAIN_COURSE"}
              label="Category"
              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as MenuCategory })}
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Price (₹) *"
            type="number"
            required
            fullWidth
            size="small"
            value={editingItem.price || 0}
            onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
          />

          <TextField
            label="Description (Optional)"
            multiline
            rows={2}
            fullWidth
            size="small"
            value={editingItem.description || ""}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
          />

          <DialogActions className="!px-0 !pt-2">
            <Button onClick={() => setOpenItemModal(false)} color="inherit" sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <UISubmitButton type="submit" text="Save Item" loading={isSavingMenu} />
          </DialogActions>
        </form>
      </UiDialog>
    </MainContainer>
  );
}
