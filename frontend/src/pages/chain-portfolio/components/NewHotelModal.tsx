import { useState } from "react";
import toast from "react-hot-toast";
import { Building2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { HotelProperty } from "../../../utils/interfaces/Interface";

interface NewHotelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<HotelProperty>) => Promise<void>;
  isLoading: boolean;
}

export function NewHotelModal({ open, onClose, onSubmit, isLoading }: NewHotelModalProps) {
  const [name, setName] = useState("");
  const [chain, setChain] = useState("Grand Horizon Hotels & Resorts");
  const [brandTier, setBrandTier] = useState("★★★★★ Luxury Heritage");
  const [location, setLocation] = useState("");
  const [starRating, setStarRating] = useState("5 Star Luxury");
  const [roomCount, setRoomCount] = useState(40);
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [upiId, setUpiId] = useState("");
  const [managerName, setManagerName] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter the hotel name");
    if (!location.trim()) return toast.error("Please enter hotel location");
    if (!gstin.trim()) return toast.error("Please enter hotel GSTIN");

    await onSubmit({
      name: name.trim(),
      chain: chain.trim(),
      brandTier: brandTier.trim(),
      location: location.trim(),
      starRating: starRating.trim(),
      roomCount: Number(roomCount) || 30,
      occupancyRate: 80,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, "")}@grandhorizonhotels.com`,
      address: address.trim() || `${location}, India`,
      gstin: gstin.trim(),
      upiId: upiId.trim() || "hotel@upi",
      managerName: managerName.trim() || "General Manager",
      dailyRevenue: (Number(roomCount) || 30) * 0.8 * 6000,
      adr: 6000,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-brand-700 dark:text-brand-300" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Hotel Property</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Property / Hotel Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Horizon Hills Resort"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-semibold dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Chain Corporate Brand</label>
              <input
                type="text"
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Location / City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Manali, HP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Brand Tier / Category</label>
              <input
                type="text"
                value={brandTier}
                onChange={(e) => setBrandTier(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 text-amber-700 font-semibold dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Total Rooms (Keys) *</label>
              <input
                type="number"
                min={1}
                required
                value={roomCount}
                onChange={(e) => setRoomCount(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Star Rating Classification</label>
              <select
                value={starRating}
                onChange={(e) => setStarRating(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-2.5 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="5 Star Deluxe">5 Star Deluxe</option>
                <option value="5 Star Luxury">5 Star Luxury</option>
                <option value="4 Star Premium">4 Star Premium</option>
                <option value="3 Star Comfort">3 Star Comfort</option>
                <option value="Heritage Palace">Heritage Palace</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">General Manager</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Mehra"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Contact Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Official Email</label>
              <input
                type="email"
                placeholder="hotel@grandhorizonhotels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">Physical Address</label>
            <input
              type="text"
              placeholder="Mall Road, Hadimba Temple Way, Manali..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Registered GSTIN *</label>
              <input
                type="text"
                required
                placeholder="e.g. 02AAAAA0000A1Z4"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">UPI VPA</label>
              <input
                type="text"
                placeholder="e.g. hotel@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" type="submit" loading={isLoading} className="font-semibold">
              Add Hotel to Chain
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
