import * as Yup from "yup";
import type { PlanKind } from "../../../utils/interfaces/Interface";

export interface PlanForm {
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

export const planSchema = Yup.object({
  name: Yup.string().trim().required("Plan name is required"),
  rate: Yup.number().moreThan(0, "Rate 0 se zyada hona chahiye").required("Rate is required"),
  durationHours: Yup.number().when("kind", { is: "FIXED", then: (schema) => schema.moreThan(0, "Hours daalo").required(), otherwise: (schema) => schema.nullable() }),
  checkoutTime: Yup.string().when("kind", { is: "TILL_TIME", then: (schema) => schema.required("Time daalo"), otherwise: (schema) => schema.nullable() }),
});

export const planTableColumns = [
  { label: "Sr No" }, { label: "Plan" }, { label: "Type" }, { label: "Rate" },
  { label: "Applies To" }, { label: "Status" }, { label: "Action" },
];
