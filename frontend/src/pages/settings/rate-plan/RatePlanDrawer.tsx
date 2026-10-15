import { Box, FormControlLabel, Switch } from "@mui/material";
import { Form, Formik } from "formik";
import type { RatePlan } from "../../../utils/interfaces/Interface";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import RightDrawer from "../../../components/ui/drawers/RightDrawer";
import RatePlanFields from "./RatePlanFields";
import { planSchema, type PlanForm } from "./ratePlanConfig";

interface RatePlanDrawerProps {
  open: boolean;
  plan: RatePlan | null;
  initialValues: PlanForm;
  loading: boolean;
  onClose: () => void;
  onSave: (values: PlanForm) => Promise<void>;
}

export default function RatePlanDrawer({ open, plan, initialValues, loading, onClose, onSave }: RatePlanDrawerProps) {
  return <RightDrawer open={open} onClose={onClose} title={plan ? "Edit rate plan" : "Add rate plan"}>
    <Formik enableReinitialize initialValues={initialValues} validationSchema={planSchema} onSubmit={onSave}>
      {({ values, setFieldValue }) => <Form>
        <RatePlanFields />
        <FormControlLabel control={<Switch checked={values.isActive} onChange={(event) => setFieldValue("isActive", event.target.checked)} />} label="Active (check-in me dikhega)" />
        <Box className="flex justify-end pt-2"><UISubmitButton text="Save plan" loading={loading} /></Box>
      </Form>}
    </Formik>
  </RightDrawer>;
}
