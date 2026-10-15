import { useFormikContext } from "formik";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import ImageUploadField from "../../../components/forms/ImageUploadField";
import { ID_TYPES } from "../../../utils/helper/constants";
import type { CheckInFormValues } from "../types";

export default function PrimaryGuestFields({ onPhoneChange }: { onPhoneChange: (phone: string) => void }) {
  const { values } = useFormikContext<CheckInFormValues>();
  return <div className="space-y-4 pt-2">
    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Guest Identification (KYC)</div>
    {values.customerType === "NEW" && <TextInput name="phone" label="Mobile Number" type="tel" digitsOnly maxLength={10} required prefix="+91" placeholder="10-digit mobile number" onValueChange={onPhoneChange} />}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><TextInput name="name" label="Full Name" required placeholder="Guest Name" /><TextInput name="address" label="City / Residence Address" placeholder="e.g. Mumbai, Maharashtra" /><SearchableSelectDropdown name="idType" label="Government ID Type" required options={ID_TYPES} /><TextInput name="idNumber" label="ID Number" required placeholder="Document Number" /></div>
    <ImageUploadField name="idImage" label="ID Document Photo / Scan (Optional)" />
  </div>;
}
