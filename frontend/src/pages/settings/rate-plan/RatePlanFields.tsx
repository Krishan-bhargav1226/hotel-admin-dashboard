import { useFormikContext } from "formik";
import { TextInput } from "../../../components/forms/BasicTextFields";
import RadioButton from "../../../components/forms/RadioButton";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import { useGetRoomTypesQuery } from "../../../store/services/room-type/roomTypeSlice";
import { PLAN_KINDS } from "../../../utils/helper/constants";
import type { PlanForm } from "./ratePlanConfig";

export default function RatePlanFields() {
  const { values } = useFormikContext<PlanForm>();
  const { data: types = [] } = useGetRoomTypesQuery();
  const hint = PLAN_KINDS.find((kind) => kind.id === values.kind)?.hint;

  return <>
    <RadioButton name="kind" label="Plan type" options={PLAN_KINDS.map((kind) => ({ id: kind.id, name: kind.name }))} row />
    <p className="mb-3 text-xs text-gray-500">{hint}</p>
    <TextInput name="name" label="Plan name" required />
    <TextInput name="rate" label={values.kind === "HOURLY" ? "Rate per hour ₹" : "Price ₹"} type="number" required />
    {values.kind === "FIXED" && <TextInput name="durationHours" label="Included hours" type="number" required />}
    {values.kind === "TILL_TIME" && <TextInput name="checkoutTime" label="Valid till (time)" type="time" required />}
    {values.kind === "HOURLY" && <TextInput name="minHours" label="Minimum hours billed" type="number" />}
    {values.kind !== "HOURLY" && <TextInput name="overtimeRate" label="Extra hour rate ₹ (after time ends)" type="number" />}
    <TextInput name="graceMinutes" label="Grace minutes" type="number" helper="No extra charge applied within this grace period" />
    <SearchableSelectDropdown name="roomTypeIds" label="Applies to room types" multiple options={types.map((type) => ({ id: type.id, name: type.name }))} helper="Leave empty to apply to all room types" />
  </>;
}
