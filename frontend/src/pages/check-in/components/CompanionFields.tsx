import { FieldArray, useFormikContext } from "formik";
import { MdAdd, MdDelete } from "react-icons/md";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import { ID_TYPES } from "../../../utils/helper/constants";
import type { Companion } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";

const blankCompanion = (): Companion => ({ name: "", idType: "AADHAAR", idNumber: "", idImage: "" });

export default function CompanionFields() {
  const { values } = useFormikContext<CheckInFormValues>();
  if (values.partyType !== "COUPLE" && values.partyType !== "FAMILY") return null;
  return <div className="mt-5 border-t border-slate-100 pt-4">
    <FieldArray name="companions">{({ push, remove }) => <div className="space-y-4">
      <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-800">{values.partyType === "COUPLE" ? "Co-Guest Details (Spouse / Partner)" : `Co-Guests & Family Members (${values.companions.length})`}</span>{values.partyType === "FAMILY" && <button type="button" onClick={() => push(blankCompanion())} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"><MdAdd size={15} /><span>Add Another Member</span></button>}</div>
      {values.companions.map((_companion, index) => <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all">
        <div className="mb-2.5 flex items-center justify-between"><span className="text-xs font-bold text-slate-700">Member {index + 2}: {values.partyType === "COUPLE" ? "Spouse / Partner" : "Co-Traveler"}</span>{values.partyType === "FAMILY" && <button type="button" onClick={() => remove(index)} className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"><MdDelete size={14} /><span>Remove</span></button>}</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3"><TextInput name={`companions.${index}.name`} label="Full Name" required placeholder="Name" /><SearchableSelectDropdown name={`companions.${index}.idType`} label="ID Type" options={ID_TYPES} /><TextInput name={`companions.${index}.idNumber`} label="ID Number" required placeholder="ID Number" /></div>
      </div>)}
    </div>}</FieldArray>
  </div>;
}
