import { Box } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import RightDrawer from "../../components/ui/drawers/RightDrawer";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import { TextInput } from "../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../components/forms/SelectDropdown";
import RoomPhoto from "../../components/ui/room/RoomPhoto";
import { useCreateBulkRoomsMutation, useCreateRoomMutation, useUpdateRoomMutation } from "../../store/services/room/roomSlice";
import { useGetRoomTypesQuery } from "../../store/services/room-type/roomTypeSlice";
import { getErrorMessage } from "../../utils/helper/helper";
import { getRoomMeta } from "../../utils/helper/roomImages";
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
          initialValues={{ from: "", to: "", floor: "", roomTypeId: types[0]?.id || "", prefix: "" }}
          validationSchema={bulkSchema}
          onSubmit={async (v) => {
            try {
              const n = await createBulk({ from: Number(v.from), to: Number(v.to), floor: v.floor, roomTypeId: v.roomTypeId, prefix: v.prefix }).unwrap();
              toast.success(`${n} rooms added`);
              onClose();
            } catch (e) { toast.error(getErrorMessage(e)); }
          }}
        >
          {({ values }) => {
            const matchedType = types.find((t) => t.id === values.roomTypeId);
            return (
              <Form className="space-y-3">
                {matchedType && (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <RoomPhoto roomType={matchedType} aspectRatio="video" showBadge className="h-32 w-full" />
                  </div>
                )}
                <Box className="grid grid-cols-2 gap-3">
                  <TextInput name="from" label="From number" type="number" required helper="e.g. 101" />
                  <TextInput name="to" label="To number" type="number" required helper="e.g. 110" />
                </Box>
                <TextInput name="prefix" label="Prefix (optional)" helper="e.g. A → A101" />
                <TextInput name="floor" label="Floor / Block" placeholder="e.g. Floor 1" />
                <SearchableSelectDropdown name="roomTypeId" label="Room type & Category" required options={typeOptions} />
                <Box className="flex justify-end pt-2"><UISubmitButton text="Add rooms" loading={c3} /></Box>
              </Form>
            );
          }}
        </Formik>
      ) : (
        <Formik
          enableReinitialize
          initialValues={{
            number: room?.number ?? "",
            floor: room?.floor ?? "",
            roomTypeId: room?.roomTypeId ?? (types[0]?.id || ""),
            notes: room?.notes ?? "",
            bedType: room?.bedType ?? "",
            image: room?.image ?? "",
          }}
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
          {({ values }) => {
            const matchedType = types.find((t) => t.id === values.roomTypeId);
            const meta = getRoomMeta(null, matchedType);
            return (
              <Form className="space-y-3">
                {/* Photo Preview of the Room Type */}
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <RoomPhoto
                    src={values.image || undefined}
                    roomType={matchedType}
                    aspectRatio="video"
                    showBadge
                    className="h-36 w-full"
                  />
                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-xs">
                    <span className="font-semibold text-slate-800">{matchedType?.name || meta.name}</span>
                    <span className="text-[11px] text-slate-500 block">{meta.guestTypeLabel} · {meta.bedConfig}</span>
                  </div>
                </div>

                <TextInput name="number" label="Room number" required autoFocus placeholder="e.g. 201" />
                <TextInput name="floor" label="Floor / Block" placeholder="e.g. Floor 2" />
                <SearchableSelectDropdown name="roomTypeId" label="Room Category / Type" required options={typeOptions} />
                <TextInput name="bedType" label="Custom Bed Config (Optional)" placeholder={`Default: ${meta.bedConfig}`} />
                <TextInput name="image" label="Custom Room Photo URL (Optional)" placeholder="Leave blank to use default category photo" />
                <TextInput name="notes" label="Notes / Features" multiline rows={2} placeholder="e.g. Corner room with terrace, quiet location" />
                <Box className="flex justify-end pt-2"><UISubmitButton text={room ? "Update Room" : "Add Room"} loading={c1 || c2} /></Box>
              </Form>
            );
          }}
        </Formik>
      )}
    </RightDrawer>
  );
};

export default RoomForm;
