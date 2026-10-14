import { useState } from "react";
import { Box } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import RenderTable from "../../../components/tables/RenderTable";
import { TableRow } from "../../../components/tables/TableRow";
import { IconButton } from "../../../components/ui/buttons/IconButton";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import RightDrawer from "../../../components/ui/drawers/RightDrawer";
import { TextInput } from "../../../components/forms/BasicTextFields";
import {
  useCreateRoomTypeMutation, useDeleteRoomTypeMutation, useGetRoomTypesQuery, useUpdateRoomTypeMutation,
} from "../../../store/services/room-type/roomTypeSlice";
import { ShowConfirmModal } from "../../../hooks/useShowConfirmModal";
import { getErrorMessage } from "../../../utils/helper/helper";
import type { RoomType as RoomTypeModel } from "../../../utils/interfaces/Interface";

const columns = [{ label: "Sr No" }, { label: "Name" }, { label: "Description" }, { label: "Action" }];

const RoomType = () => {
  const { data: types = [] } = useGetRoomTypesQuery();
  const [create, { isLoading: c1 }] = useCreateRoomTypeMutation();
  const [update, { isLoading: c2 }] = useUpdateRoomTypeMutation();
  const [remove] = useDeleteRoomTypeMutation();
  const [drawer, setDrawer] = useState<{ open: boolean; item: RoomTypeModel | null }>({ open: false, item: null });

  const handleDelete = async (t: RoomTypeModel) => {
    const ok = await ShowConfirmModal({ title: `Delete "${t.name}"?`, confirmButtonText: "Delete" });
    if (!ok) return;
    try { await remove(t.id).unwrap(); toast.success("Room type deleted"); } catch (e) { toast.error(getErrorMessage(e)); }
  };

  return (
    <>
      <Box className="mb-3 flex justify-end">
        <UISubmitButton type="button" color="secondary" text="Add room type" onClick={() => setDrawer({ open: true, item: null })} />
      </Box>
      <RenderTable columns={columns}>
        {types.map((t, i) => (
          <TableRow key={t.id} itemIndex={i}>
            <td className="p-3 rounded-l-lg">{i + 1}</td>
            <td className="p-3 font-semibold">{t.name}</td>
            <td className="p-3 text-sm text-gray-600">{t.description || "-"}</td>
            <td className="p-3 rounded-r-lg">
              <Box className="flex gap-1">
                <IconButton tooltip="Edit" icon={<FaPenToSquare size={16} />} bgColor="GREEN" onClick={() => setDrawer({ open: true, item: t })} />
                <IconButton tooltip="Delete" icon={<FaTrashAlt size={16} />} onClick={() => handleDelete(t)} />
              </Box>
            </td>
          </TableRow>
        ))}
      </RenderTable>

      <RightDrawer open={drawer.open} onClose={() => setDrawer((d) => ({ ...d, open: false }))} title={drawer.item ? "Edit room type" : "Add room type"}>
        <Formik
          enableReinitialize
          initialValues={{ name: drawer.item?.name ?? "", description: drawer.item?.description ?? "" }}
          validationSchema={Yup.object({ name: Yup.string().trim().required("Name is required") })}
          onSubmit={async (v) => {
            try {
              if (drawer.item) await update({ id: drawer.item.id, data: v }).unwrap();
              else await create(v).unwrap();
              toast.success("Saved");
              setDrawer((d) => ({ ...d, open: false }));
            } catch (e) { toast.error(getErrorMessage(e)); }
          }}
        >
          <Form>
            <TextInput name="name" label="Name" required autoFocus />
            <TextInput name="description" label="Description" multiline rows={2} />
            <Box className="flex justify-end"><UISubmitButton text="Save" loading={c1 || c2} /></Box>
          </Form>
        </Formik>
      </RightDrawer>
    </>
  );
};

export default RoomType;
