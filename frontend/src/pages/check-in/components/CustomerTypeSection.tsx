import { useFormikContext } from "formik";
import { MdPerson, MdSearch, MdStar } from "react-icons/md";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { formatCurrency } from "../../../utils/helper/helper";
import type { GuestWithStats } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";

interface CustomerTypeSectionProps {
  guests: GuestWithStats[];
  onSelectRepeatGuest: (guest: GuestWithStats) => void;
  onPhoneChange: (phone: string) => void;
}

export default function CustomerTypeSection({ guests, onSelectRepeatGuest, onPhoneChange }: CustomerTypeSectionProps) {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  const repeatGuest = guests.find((guest) => guest.phone === values.phone && values.phone.length === 10);
  return <>
    <div className="mb-4 grid grid-cols-2 gap-3">
      <button type="button" onClick={() => setFieldValue("customerType", "NEW")} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3.5 transition-all ${values.customerType === "NEW" ? "border-brand-700 bg-brand-700 font-bold text-white shadow-2xs" : "border-slate-200 bg-slate-50/70 font-semibold text-slate-700 hover:bg-slate-100"}`}><MdPerson size={18} /><span>✨ New Customer (First-Time)</span></button>
      <button type="button" onClick={() => setFieldValue("customerType", "REPEAT")} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3.5 transition-all ${values.customerType === "REPEAT" ? "border-brand-700 bg-brand-700 font-bold text-white shadow-2xs" : "border-slate-200 bg-slate-50/70 font-semibold text-slate-700 hover:bg-slate-100"}`}><MdStar size={18} className={values.customerType === "REPEAT" ? "text-amber-400" : "text-amber-500"} /><span>🔄 Repeating Customer (In CRM)</span></button>
    </div>
    {values.customerType === "REPEAT" && <div className="mb-4 space-y-3 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-brand-950"><MdSearch size={16} className="text-brand-600" />Search & Select Returning Guest:</span><span className="text-[11px] font-medium text-brand-700">{guests.length} profiles in CRM</span></div>
      {guests.length > 0 && <div className="flex flex-wrap gap-2">{guests.slice(0, 4).map((guest) => <button key={guest.id} type="button" onClick={() => onSelectRepeatGuest(guest)} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${values.phone === guest.phone ? "border-brand-600 bg-brand-600 text-white shadow-2xs" : "border-brand-200 bg-white text-slate-700 hover:bg-brand-50"}`}><span>{guest.name}</span><span className="font-mono text-[10px] opacity-70">({guest.phone.slice(-4)})</span></button>)}</div>}
      <div className="pt-1"><label className="mb-1 block text-xs font-semibold text-slate-700">Or Type Guest Mobile Number:</label><TextInput name="phone" label="" type="tel" digitsOnly maxLength={10} required prefix="+91" placeholder="Enter 10-digit mobile number" onValueChange={onPhoneChange} /></div>
      {repeatGuest && <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50 p-2.5 text-xs text-emerald-950"><div className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /><span><strong>{repeatGuest.name}</strong> recognized · {repeatGuest.visits} stays ({formatCurrency(repeatGuest.totalSpent)} spent). Details autofilled below!</span></div><span className="rounded bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">KYC Verified</span></div>}
    </div>}
  </>;
}
