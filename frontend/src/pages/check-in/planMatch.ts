import type { RatePlan } from "../../utils/interfaces/Interface";
import type { DurationType } from "./types";

export function plansForDuration(duration: DurationType, plans: RatePlan[]) {
  if (duration === "HOURLY") return plans.filter((plan) => plan.kind === "HOURLY");
  if (duration === "12_HOURS") {
    return plans.filter((plan) => plan.kind === "TILL_TIME" || (plan.kind === "FIXED" && plan.durationHours > 0 && plan.durationHours < 24));
  }
  const nights = plans.filter((plan) => plan.kind === "FIXED" && plan.durationHours >= 24);
  return nights.length ? nights : plans.filter((plan) => plan.kind === "FIXED");
}

export function getMatchingPlan(duration: DurationType, plans: RatePlan[]) {
  return plansForDuration(duration, plans)[0] ?? plans[0];
}
