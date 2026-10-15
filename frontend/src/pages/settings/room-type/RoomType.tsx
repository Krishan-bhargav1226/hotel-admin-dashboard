import { useState } from "react";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import RightDrawer from "../../../components/ui/drawers/RightDrawer";
import RoomTypeTable from "./RoomTypeTable";
import RoomTypeForm, { type RoomTypeFormValues } from "./RoomTypeForm";
import { useCreateRoomTypeMutation, useDeleteRoomTypeMutation, useGetRoomTypesQuery, useUpdateRoomTypeMutation } from "../../../store/services/room-type/roomTypeSlice";
import { ShowConfirmModal } from "../../../hooks/useShowConfirmModal";
import { getErrorMessage } from "../../../utils/helper/helper";
import type { RoomType } from "../../../utils/interfaces/Interface";

export default function RoomType() {
  const { data: types = [] } = useGetRoomTypesQuery();
  const [create, { isLoading: creating }] = useCreateRoomTypeMutation();
  const [update, { isLoading: updating }] = useUpdateRoomTypeMutation();
  const [remove] = useDeleteRoomTypeMutation();
  const [drawer, setDrawer] = useState<{ open: boolean; item: RoomType | null }>({ open: false, item: null });

  const handleDelete = async (type: RoomType) => {
    const confirmed = await ShowConfirmModal({ title: `Delete "${type.name}"?`, confirmButtonText: "Delete" });
    if (!confirmed) return;
    try { await remove(type.id).unwrap(); toast.success("Room type deleted"); }
    catch (error) { toast.error(getErrorMessage(error)); }
  };

  const handleSave = async (values: RoomTypeFormValues) => {
    try {
      if (drawer.item) await update({ id: drawer.item.id, data: values }).unwrap();
      else await create(values).unwrap();
      toast.success("Saved");
      setDrawer((current) => ({ ...current, open: false }));
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  return <>
    <Box className="mb-3 flex justify-end"><UISubmitButton type="button" color="secondary" text="Add room type" onClick={() => setDrawer({ open: true, item: null })} /></Box>
    <RoomTypeTable types={types} onEdit={(item) => setDrawer({ open: true, item })} onDelete={handleDelete} />
    <RightDrawer open={drawer.open} onClose={() => setDrawer((current) => ({ ...current, open: false }))} title={drawer.item ? "Edit room type" : "Add room type"}>
      <RoomTypeForm item={drawer.item} saving={creating || updating} onSubmit={handleSave} />
    </RightDrawer>
  </>;
}
