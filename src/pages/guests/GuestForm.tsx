import { Box, FormControlLabel, Switch } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import RightDrawer from "../../components/ui/drawers/RightDrawer";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import { TextInput } from "../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../components/forms/SelectDropdown";
import ImageUploadField from "../../components/forms/ImageUploadField";
import { useCreateGuestMutation, useUpdateGuestMutation, type GuestPayload } from "../../store/services/guest/guestSlice";
import { ID_TYPES } from "../../utils/helper/constants";
import { getErrorMessage } from "../../utils/helper/helper";
import type { Guest } from "../../utils/interfaces/Interface";

interface Props {
  open: boolean;
  onClose: () => void;
  guest: Guest | null;
}

const schema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  phone: Yup.string().matches(/^\d{10}$/, "10 digit mobile number daalo").required("Phone number is required"),
  idType: Yup.string().required(),
  idNumber: Yup.string().trim().min(4, "Valid ID number daalo").required("ID number is required"),
});

const GuestForm = ({ open, onClose, guest }: Props) => {
  const [createGuest, { isLoading: c1 }] = useCreateGuestMutation();
  const [updateGuest, { isLoading: c2 }] = useUpdateGuestMutation();

  const initial: GuestPayload = {
    name: guest?.name ?? "", phone: guest?.phone ?? "", idType: guest?.idType ?? "AADHAAR",
    idNumber: guest?.idNumber ?? "", idImage: guest?.idImage ?? "", address: guest?.address ?? "",
    isFlagged: guest?.isFlagged ?? false, flagReason: guest?.flagReason ?? "",
  };

  return (
    <RightDrawer open={open} onClose={onClose} title={guest ? "Edit guest" : "Add guest"}>
      <Formik
        enableReinitialize
        initialValues={initial}
        validationSchema={schema}
        onSubmit={async (v) => {
          try {
            if (guest) await updateGuest({ id: guest.id, data: v }).unwrap();
            else await createGuest(v).unwrap();
            toast.success(guest ? "Guest updated" : "Guest added");
            onClose();
          } catch (e) { toast.error(getErrorMessage(e)); }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <TextInput name="phone" label="Mobile number" type="tel" digitsOnly maxLength={10} required />
            <TextInput name="name" label="Guest name" required />
            <SearchableSelectDropdown name="idType" label="ID type" required options={ID_TYPES} />
            <TextInput name="idNumber" label="ID number" required />
            <ImageUploadField name="idImage" label="ID photo" />
            <TextInput name="address" label="Address / City" multiline rows={2} />
            <FormControlLabel
              control={<Switch checked={values.isFlagged} onChange={(e) => setFieldValue("isFlagged", e.target.checked)} />}
              label="Flag this guest"
            />
            {values.isFlagged && <TextInput name="flagReason" label="Reason" />}
            <Box className="flex justify-end pt-2"><UISubmitButton text={guest ? "Update" : "Save guest"} loading={c1 || c2} /></Box>
          </Form>
        )}
      </Formik>
    </RightDrawer>
  );
};

export default GuestForm;
