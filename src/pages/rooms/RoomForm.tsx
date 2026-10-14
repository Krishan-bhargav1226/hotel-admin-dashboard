import { Box } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import RightDrawer from "../../components/ui/drawers/RightDrawer";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import { TextInput } from "../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../components/forms/SelectDropdown";
import { useCreateBulkRoomsMutation, useCreateRoomMutation, useUpdateRoomMutation } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { getErrorMessage } from "../../utils/helper/helper";
import type { Room } from "../../utils/interfaces/Interface";

interface Props {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  bulk: boolean;
}

const single = Yup.object({
  number: Yup.string().trim().required("Room number is required"),
  roomTypeId: Yup.string().required("Room type is required"),
});
const bulkSchema = Yup.object({
  from: Yup.number().min(0).required("From is required"),
  to: Yup.number().min(0).required("To is required"),
  roomTypeId: Yup.string().required("Room type is required"),
});

const RoomForm = ({ open, onClose, room, bulk }: Props) => {
  const { data: types = [] } = useGetRoomTypesQuery();
  const [createRoom, { isLoading: c1 }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: c2 }] = useUpdateRoomMutation();
  const [createBulk, { isLoading: c3 }] = useCreateBulkRoomsMutation();
  const typeOptions = types.map((t) => ({ id: t.id, name: t.name }));

  return (
    <RightDrawer open={open} onClose={onClose} title={bulk ? "Add multiple rooms" : room ? "Edit room" : "Add room"}>
      {bulk ? (
        <Formik
          initialValues={{ from: "", to: "", floor: "", roomTypeId: "", prefix: "" }}
          validationSchema={bulkSchema}
          onSubmit={async (v) => {
            try {
              const n = await createBulk({ from: Number(v.from), to: Number(v.to), floor: v.floor, roomTypeId: v.roomTypeId, prefix: v.prefix }).unwrap();
              toast.success(`${n} rooms added`);
              onClose();
            } catch (e) { toast.error(getErrorMessage(e)); }
          }}
        >
          <Form className="space-y-1">
            <Box className="grid grid-cols-2 gap-3">
              <TextInput name="from" label="From number" type="number" required helper="e.g. 101" />
              <TextInput name="to" label="To number" type="number" required helper="e.g. 110" />
            </Box>
            <TextInput name="prefix" label="Prefix (optional)" helper="e.g. A → A101" />
            <TextInput name="floor" label="Floor / Block" />
            <SearchableSelectDropdown name="roomTypeId" label="Room type" required options={typeOptions} />
            <Box className="flex justify-end pt-2"><UISubmitButton text="Add rooms" loading={c3} /></Box>
          </Form>
        </Formik>
      ) : (
        <Formik
          enableReinitialize
          initialValues={{ number: room?.number ?? "", floor: room?.floor ?? "", roomTypeId: room?.roomTypeId ?? "", notes: room?.notes ?? "" }}
          validationSchema={single}
          onSubmit={async (v) => {
            try {
              if (room) await updateRoom({ id: room.id, data: v }).unwrap();
              else await createRoom(v).unwrap();
              toast.success(room ? "Room updated" : "Room added");
              onClose();
            } catch (e) { toast.error(getErrorMessage(e)); }
          }}
        >
          <Form className="space-y-1">
            <TextInput name="number" label="Room number" required autoFocus />
            <TextInput name="floor" label="Floor / Block" />
            <SearchableSelectDropdown name="roomTypeId" label="Room type" required options={typeOptions} />
            <TextInput name="notes" label="Notes" multiline rows={2} />
            <Box className="flex justify-end pt-2"><UISubmitButton text={room ? "Update" : "Add room"} loading={c1 || c2} /></Box>
          </Form>
        </Formik>
      )}
    </RightDrawer>
  );
};

export default RoomForm;
