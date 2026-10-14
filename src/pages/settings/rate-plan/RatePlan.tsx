import { useState } from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";
import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import RenderTable from "../../../components/tables/RenderTable";
import { TableRow } from "../../../components/tables/TableRow";
import { IconButton } from "../../../components/ui/buttons/IconButton";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import StatusChip from "../../../components/ui/badges/StatusChip";
import RightDrawer from "../../../components/ui/drawers/RightDrawer";
import { TextInput } from "../../../components/forms/BasicTextFields";
import RadioButton from "../../../components/forms/RadioButton";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import {
  useCreateRatePlanMutation, useDeleteRatePlanMutation, useGetRatePlansQuery, useUpdateRatePlanMutation,
} from "../../../store/services/rate-plan/ratePlanSlice";
import { useGetRoomTypesQuery } from "../../../store/services/room-type/roomTypeSlice";
import { ShowConfirmModal } from "../../../hooks/useShowConfirmModal";
import { describePlan } from "../../../utils/helper/billing";
import { PLAN_KINDS, planKindName } from "../../../utils/helper/constants";
import { getErrorMessage } from "../../../utils/helper/helper";
import { colors } from "../../../utils/theme/colorTheme";
import type { PlanKind, RatePlan as RatePlanModel } from "../../../utils/interfaces/Interface";

interface PlanForm {
  name: string;
  kind: PlanKind;
  rate: string;
  durationHours: string;
  checkoutTime: string;
  minHours: string;
  overtimeRate: string;
  graceMinutes: string;
  roomTypeIds: string[];
  isActive: boolean;
}

const schema = Yup.object({
  name: Yup.string().trim().required("Plan name is required"),
  rate: Yup.number().moreThan(0, "Rate 0 se zyada hona chahiye").required("Rate is required"),
  durationHours: Yup.number().when("kind", { is: "FIXED", then: (s) => s.moreThan(0, "Hours daalo").required(), otherwise: (s) => s.nullable() }),
  checkoutTime: Yup.string().when("kind", { is: "TILL_TIME", then: (s) => s.required("Time daalo"), otherwise: (s) => s.nullable() }),
});

const KindFields = () => {
  const { values } = useFormikContext<PlanForm>();
  const { data: types = [] } = useGetRoomTypesQuery();
  const hint = PLAN_KINDS.find((k) => k.id === values.kind)?.hint;
  const fixed = values.kind !== "HOURLY";

  return (
    <>
      <RadioButton name="kind" label="Plan type" options={PLAN_KINDS.map((k) => ({ id: k.id, name: k.name }))} row />
      <p className="mb-3 text-xs text-gray-500">{hint}</p>
      <TextInput name="name" label="Plan name" required />
      <TextInput name="rate" label={values.kind === "HOURLY" ? "Rate per hour ₹" : "Price ₹"} type="number" required />
      {values.kind === "FIXED" && <TextInput name="durationHours" label="Included hours" type="number" required />}
      {values.kind === "TILL_TIME" && <TextInput name="checkoutTime" label="Valid till (time)" type="time" required />}
      {values.kind === "HOURLY" && <TextInput name="minHours" label="Minimum hours billed" type="number" />}
      {fixed && <TextInput name="overtimeRate" label="Extra hour rate ₹ (after time ends)" type="number" />}
      <TextInput name="graceMinutes" label="Grace minutes" type="number" helper="Itne minute tak extra charge nahi lagega" />
      <SearchableSelectDropdown
        name="roomTypeIds" label="Applies to room types" multiple
        options={types.map((t) => ({ id: t.id, name: t.name }))}
        helper="Khali chhodo = sab rooms par lagega"
      />
    </>
  );
};

const columns = [{ label: "Sr No" }, { label: "Plan" }, { label: "Type" }, { label: "Rate" }, { label: "Applies To" }, { label: "Status" }, { label: "Action" }];

const RatePlan = () => {
  const { data: plans = [] } = useGetRatePlansQuery();
  const { data: types = [] } = useGetRoomTypesQuery();
  const [create, { isLoading: c1 }] = useCreateRatePlanMutation();
  const [update, { isLoading: c2 }] = useUpdateRatePlanMutation();
  const [remove] = useDeleteRatePlanMutation();
  const [drawer, setDrawer] = useState<{ open: boolean; item: RatePlanModel | null }>({ open: false, item: null });

  const close = () => setDrawer((d) => ({ ...d, open: false }));
  const p = drawer.item;
  const initial: PlanForm = {
    name: p?.name ?? "", kind: p?.kind ?? "HOURLY", rate: p ? String(p.rate) : "",
    durationHours: p ? String(p.durationHours || "") : "24", checkoutTime: p?.checkoutTime ?? "20:00",
    minHours: p ? String(p.minHours) : "1", overtimeRate: p ? String(p.overtimeRate) : "",
    graceMinutes: p ? String(p.graceMinutes) : "10", roomTypeIds: p?.roomTypeIds ?? [], isActive: p?.isActive ?? true,
  };

  const handleDelete = async (plan: RatePlanModel) => {
    const ok = await ShowConfirmModal({ title: `Delete "${plan.name}"?`, text: "Purani stays ke bill par koi asar nahi padega.", confirmButtonText: "Delete" });
    if (!ok) return;
    try { await remove(plan.id).unwrap(); toast.success("Plan deleted"); } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <>
      <Box className="mb-3 flex justify-end">
        <UISubmitButton type="button" color="secondary" text="Add rate plan" onClick={() => setDrawer({ open: true, item: null })} />
      </Box>
      <RenderTable columns={columns}>
        {plans.map((plan, i) => (
          <TableRow key={plan.id} itemIndex={i}>
            <td className="p-3 rounded-l-lg">{i + 1}</td>
            <td className="p-3 font-semibold">{plan.name}</td>
            <td className="p-3 text-sm">{planKindName(plan.kind)}</td>
            <td className="p-3 text-sm">{describePlan(plan)}</td>
            <td className="p-3 text-sm">
              {plan.roomTypeIds.length === 0 ? "All rooms" : plan.roomTypeIds.map((id) => types.find((t) => t.id === id)?.name).filter(Boolean).join(", ")}
            </td>
            <td className="p-3"><StatusChip label={plan.isActive ? "Active" : "Inactive"} color={plan.isActive ? colors.success : colors.status.maintenance} /></td>
            <td className="p-3 rounded-r-lg">
              <Box className="flex gap-1">
                <IconButton tooltip="Edit" icon={<FaPenToSquare size={16} />} bgColor="GREEN" onClick={() => setDrawer({ open: true, item: plan })} />
                <IconButton tooltip="Delete" icon={<FaTrashAlt size={16} />} onClick={() => handleDelete(plan)} />
              </Box>
            </td>
          </TableRow>
        ))}
      </RenderTable>

      <RightDrawer open={drawer.open} onClose={close} title={p ? "Edit rate plan" : "Add rate plan"}>
        <Formik
          enableReinitialize
          initialValues={initial}
          validationSchema={schema}
          onSubmit={async (v) => {
            const data = {
              name: v.name, kind: v.kind, rate: Number(v.rate),
              durationHours: v.kind === "FIXED" ? Number(v.durationHours) : 0,
              checkoutTime: v.checkoutTime || "20:00",
              minHours: Number(v.minHours) || 1,
              overtimeRate: v.kind === "HOURLY" ? 0 : Number(v.overtimeRate) || 0,
              graceMinutes: Number(v.graceMinutes) || 0,
              roomTypeIds: v.roomTypeIds, isActive: v.isActive,
            };
            try {
              if (p) await update({ id: p.id, data }).unwrap();
              else await create(data).unwrap();
              toast.success("Rate plan saved");
              close();
            } catch (e) { toast.error(getErrorMessage(e)); }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <KindFields />
              <FormControlLabel
                control={<Switch checked={values.isActive} onChange={(e) => setFieldValue("isActive", e.target.checked)} />}
                label="Active (check-in me dikhega)"
              />
              <Box className="flex justify-end pt-2"><UISubmitButton text="Save plan" loading={c1 || c2} /></Box>
            </Form>
          )}
        </Formik>
      </RightDrawer>
    </>
  );
};

export default RatePlan;
