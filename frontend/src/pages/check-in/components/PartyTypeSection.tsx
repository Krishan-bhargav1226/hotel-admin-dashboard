import { useFormikContext } from "formik";
import { MdAccessible, MdFamilyRestroom, MdPeople, MdPerson, MdWorkspacePremium } from "react-icons/md";
import type { PartyType } from "../types";
import type { CheckInFormValues } from "../types";

interface PartyTypeSectionProps { onPartyTypeChange: (partyType: PartyType) => void; }
const PARTY_TYPES: { value: PartyType; label: string; note: string; icon: typeof MdPerson }[] = [
  { value: "SINGLE", label: "Solo / Business", note: "1 Person", icon: MdPerson },
  { value: "COUPLE", label: "Couple / Romance", note: "2 Persons", icon: MdPeople },
  { value: "FAMILY", label: "Family / Group", note: "3-5 Persons", icon: MdFamilyRestroom },
  { value: "ACCESSIBLE", label: "Senior / Accessible", note: "Step-Free Access", icon: MdAccessible },
  { value: "VIP", label: "VIP Luxury", note: "Penthouse & Butler", icon: MdWorkspacePremium },
];

export default function PartyTypeSection({ onPartyTypeChange }: PartyTypeSectionProps) {
  const { values } = useFormikContext<CheckInFormValues>();
  return <div className="mb-4">
    <div className="mb-2 flex items-center justify-between"><label className="block text-xs font-bold text-slate-700">Select Guest Profile & Party Type:</label><span className="text-[11px] font-medium text-slate-500">Tailors room allocation recommendations</span></div>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">{PARTY_TYPES.map(({ value, label, note, icon: Icon }) => <button key={value} type="button" onClick={() => onPartyTypeChange(value)} className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${values.partyType === value ? "border-brand-700 bg-brand-700 font-bold text-white shadow-2xs" : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"}`}><Icon size={20} className="mb-1" /><span className="text-xs font-bold">{label}</span><span className="text-[10px] opacity-75">{note}</span></button>)}</div>
  </div>;
}
