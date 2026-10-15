import { useFormikContext } from "formik";
import CustomerTypeSection from "./CustomerTypeSection";
import PartyTypeSection from "./PartyTypeSection";
import PrimaryGuestFields from "./PrimaryGuestFields";
import CompanionFields from "./CompanionFields";
import type { GuestWithStats } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues, PartyType } from "../types";

interface GuestDetailsStepProps {
  guests: GuestWithStats[];
  onSelectRepeatGuest: (guest: GuestWithStats) => void;
  onPhoneChange: (phone: string) => void;
  onPartyTypeChange: (partyType: PartyType) => void;
}

export default function GuestDetailsStep({ guests, onSelectRepeatGuest, onPhoneChange, onPartyTypeChange }: GuestDetailsStepProps) {
  const { values } = useFormikContext<CheckInFormValues>();
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
      <div><span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">Step 1 of 4</span><h2 className="text-base font-bold text-slate-900">Guest Status: New or Repeating Customer?</h2></div>
    </div>
    <CustomerTypeSection guests={guests} onSelectRepeatGuest={onSelectRepeatGuest} onPhoneChange={onPhoneChange} />
    {values.customerType === "NEW" && <PartyTypeSection onPartyTypeChange={onPartyTypeChange} />}
    <PrimaryGuestFields onPhoneChange={onPhoneChange} />
    <CompanionFields />
  </section>;
}
