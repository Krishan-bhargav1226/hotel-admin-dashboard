import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { useCreateRatePlanMutation, useDeleteRatePlanMutation, useGetRatePlansQuery, useUpdateRatePlanMutation } from "../../../store/services/rate-plan/ratePlanSlice";
import { useGetRoomTypesQuery } from "../../../store/services/room-type/roomTypeSlice";
import { ShowConfirmModal } from "../../../hooks/useShowConfirmModal";
import { getErrorMessage } from "../../../utils/helper/helper";
import type { RatePlan as RatePlanModel } from "../../../utils/interfaces/Interface";
import RatePlanDrawer from "./RatePlanDrawer";
import RatePlanTable from "./RatePlanTable";
import type { PlanForm } from "./ratePlanConfig";

const RatePlan = () => {
  const { data: plans = [] } = useGetRatePlansQuery();
  const { data: roomTypes = [] } = useGetRoomTypesQuery();
  const [create, { isLoading: creating }] = useCreateRatePlanMutation();
  const [update, { isLoading: updating }] = useUpdateRatePlanMutation();
  const [remove] = useDeleteRatePlanMutation();
  const [drawer, setDrawer] = useState<{ open: boolean; item: RatePlanModel | null }>({ open: false, item: null });

  useEffect(() => {
    setDrawer((current) => {
      if (!current.open || !current.item) return current;
      const next = plans.find((item) => item.id === current.item?.id);
      if (!next) return { ...current, open: false, item: null };
      return next === current.item ? current : { ...current, item: next };
    });
  }, [plans]);
  const plan = drawer.item;
  const initialValues: PlanForm = {
    name: plan?.name ?? "", kind: plan?.kind ?? "HOURLY", rate: plan ? String(plan.rate) : "",
    durationHours: plan ? String(plan.durationHours || "") : "24", checkoutTime: plan?.checkoutTime ?? "20:00",
    minHours: plan ? String(plan.minHours) : "1", overtimeRate: plan ? String(plan.overtimeRate) : "",
    graceMinutes: plan ? String(plan.graceMinutes) : "10", roomTypeIds: plan?.roomTypeIds ?? [], isActive: plan?.isActive ?? true,
  };
  const close = () => setDrawer((current) => ({ ...current, open: false }));

  const handleDelete = async (item: RatePlanModel) => {
    const confirmed = await ShowConfirmModal({ title: `Delete "${item.name}"?`, text: "Existing stay bills will not be affected.", confirmButtonText: "Delete" });
    if (!confirmed) return;
    try { await remove(item.id).unwrap(); toast.success("Plan deleted"); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleSave = async (values: PlanForm) => {
    const data = {
      name: values.name, kind: values.kind, rate: Number(values.rate),
      durationHours: values.kind === "FIXED" ? Number(values.durationHours) : 0,
      checkoutTime: values.checkoutTime || "20:00", minHours: Number(values.minHours) || 1,
      overtimeRate: values.kind === "HOURLY" ? 0 : Number(values.overtimeRate) || 0,
      graceMinutes: Number(values.graceMinutes) || 0, roomTypeIds: values.roomTypeIds, isActive: values.isActive,
    };
    try {
      if (plan) await update({ id: plan.id, data }).unwrap();
      else await create(data).unwrap();
      toast.success("Rate plan saved");
      close();
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  return <>
    <Box className="mb-3 flex justify-end"><UISubmitButton type="button" color="secondary" text="Add rate plan" onClick={() => setDrawer({ open: true, item: null })} /></Box>
    <RatePlanTable plans={plans} roomTypes={roomTypes} onEdit={(item) => setDrawer({ open: true, item })} onDelete={handleDelete} />
    <RatePlanDrawer open={drawer.open} plan={plan} initialValues={initialValues} loading={creating || updating} onClose={close} onSave={handleSave} />
  </>;
};

export default RatePlan;
