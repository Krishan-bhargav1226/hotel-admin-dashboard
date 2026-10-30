import { useState } from "react";
import toast from "react-hot-toast";
import { Building2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { CreateHotelInput } from "../../../store/services/property/propertySlice";
import { useSendVenueAdminOtpMutation } from "../../../store/services/property/propertySlice";

interface NewHotelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHotelInput) => Promise<void>;
  isLoading: boolean;
}

export function NewHotelModal({ open, onClose, onSubmit, isLoading }: NewHotelModalProps) {
  const [name, setName] = useState("");
  const [chain, setChain] = useState("");
  const [brandTier, setBrandTier] = useState("");
  const [location, setLocation] = useState("");
  const [starRating, setStarRating] = useState("");
  const [roomCount, setRoomCount] = useState<number | "">("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [upiId, setUpiId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendOtp, { isLoading: isSendingOtp }] = useSendVenueAdminOtpMutation();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter the hotel name");
    if (!location.trim()) return toast.error("Please enter hotel location");
    if (!gstin.trim()) return toast.error("Please enter hotel GSTIN");
    if (!adminFirstName.trim() || !adminEmail.trim() || adminPassword.length < 8) {
      return toast.error("Venue admin needs a name, email, and an 8-character password with upper, lower, and a digit.");
    }
    if (!roomCount) return toast.error("Enter the number of rooms");
    if (otp.trim().length !== 6) return toast.error("Enter the 6-digit code sent to the venue admin email.");

    await onSubmit({
      name: name.trim(),
      chain: chain.trim(),
      brandTier: brandTier.trim(),
      location: location.trim(),
      starRating: starRating.trim(),
      roomCount: Number(roomCount),
      occupancyRate: 0,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gstin: gstin.trim(),
      upiId: upiId.trim(),
      managerName: managerName.trim(),
      venueAdminFirstName: adminFirstName.trim(),
      venueAdminLastName: adminLastName.trim(),
      venueAdminEmail: adminEmail.trim(),
      venueAdminPhone: adminPhone.trim(),
      venueAdminPassword: adminPassword,
      venueAdminOtp: Number(otp),
      dailyRevenue: 0,
      adr: 0,
    });
  };

  const handleSendOtp = async () => {
    if (!adminEmail.trim()) return toast.error("Enter the venue admin email first.");
    try {
      await sendOtp({ email: adminEmail.trim() }).unwrap();
      setOtpSent(true);
      toast.success("6-digit code sent to the venue admin email.");
    } catch (err) {
      const message = err && typeof err === "object" && "data" in err
        ? (err as { data?: { messages?: string[] } }).data?.messages?.[0]
        : null;
      toast.error(message || "Could not send the verification code.");
    }
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
                onChange={(e) => setRoomCount(e.target.value === "" ? "" : Number(e.target.value))}
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
                <option value="">Select classification</option>
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

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="font-semibold text-amber-900 dark:text-amber-200">Venue admin login</p>
            <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-300/80">
              The hotel is created only after this email is verified. The admin can then sign in for this property.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input required placeholder="Admin first name" value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" />
              <input placeholder="Admin last name" value={adminLastName} onChange={(e) => setAdminLastName(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" />
              <input required type="email" placeholder="admin@hotel.com" value={adminEmail} onChange={(e) => { setAdminEmail(e.target.value); setOtpSent(false); }} className="h-9 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" />
              <input placeholder="10-digit phone" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" />
              <input required type="password" placeholder="Password, e.g. Hotel123" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900" />
              <div className="flex gap-2">
                <input inputMode="numeric" maxLength={6} placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 font-mono dark:border-slate-700 dark:bg-slate-900" />
                <Button type="button" size="sm" variant="outline" loading={isSendingOtp} onClick={handleSendOtp}>
                  {otpSent ? "Resend" : "Send code"}
                </Button>
              </div>
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
