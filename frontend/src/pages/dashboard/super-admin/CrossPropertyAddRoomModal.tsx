import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { BedDouble, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { HotelProperty } from "../../../utils/interfaces/Interface";
import { useAddRoomToPropertyMutation } from "../../../store/services/property/propertySlice";
import { useGetRoomTypesQuery } from "../../../store/services/room-type/roomTypeSlice";
import { getErrorMessage } from "../../../utils/helper/helper";

interface CrossPropertyAddRoomModalProps {
  open: boolean;
  onClose: () => void;
  properties: HotelProperty[];
  initialProperty?: HotelProperty | null;
}

export default function CrossPropertyAddRoomModal({
  open,
  onClose,
  properties,
  initialProperty,
}: CrossPropertyAddRoomModalProps) {
  const [propertyId, setPropertyId] = useState("");
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [price, setPrice] = useState("");

  const { data: roomTypes = [] } = useGetRoomTypesQuery(undefined, { skip: !open });
  const [addRoom, { isLoading }] = useAddRoomToPropertyMutation();

  useEffect(() => {
    if (initialProperty) {
      setPropertyId(initialProperty.id);
    } else if (properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [initialProperty, properties, propertyId]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return toast.error("Please select a target hotel property");
    if (!number.trim()) return toast.error("Please enter a room number");
    if (!roomTypeId) return toast.error("Choose a room type");
    if (!price || Number(price) <= 0) return toast.error("Enter the base tariff");

    try {
      await addRoom({
        propertyId,
        number: number.trim(),
        floor: floor.trim(),
        roomTypeId,
        price: Number(price),
      }).unwrap();
      const target = properties.find((p) => p.id === propertyId);
      toast.success(`Room ${number} added to ${target?.name || "property"}!`);
      setNumber("");
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BedDouble className="size-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Room to Property</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Hotel Property *
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.location ? ` (${p.location.split(",")[0]}` : ""}{p.roomCount ? `${p.location ? " - " : " ("}${p.roomCount} keys)` : ""}{(p.location || p.roomCount) ? ")" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Room Number *</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 401"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Floor</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. Floor 1"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Room type</label>
              <select
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">{roomTypes.length === 0 ? "No room types yet" : "Select a room type"}</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Base Tariff (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={1}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
              {isLoading ? "Saving..." : "Add to Inventory"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
