import { Box, FormControlLabel, Switch } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import SectionBox from "../../../components/ui/container/SectionBox";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "../../../store/services/settings/settingsSlice";
import { getErrorMessage } from "../../../utils/helper/helper";

const schema = Yup.object({
  hotelName: Yup.string().trim().required("Hotel name is required"),
  taxPercent: Yup.number().min(0).max(100).required(),
});

const HotelInfo = () => {
  const { data } = useGetSettingsQuery();
  const [update, { isLoading }] = useUpdateSettingsMutation();
  if (!data) return null;

  return (
    <SectionBox>
      <Formik
        enableReinitialize
        initialValues={data}
        validationSchema={schema}
        onSubmit={async (v) => {
          try {
            await update({ ...v, taxPercent: Number(v.taxPercent) || 0 }).unwrap();
            toast.success("Settings saved");
          } catch (e) { toast.error(getErrorMessage(e)); }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="max-w-2xl">
            <Box className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <TextInput name="hotelName" label="Hotel Name" required />
              <TextInput name="phone" label="Front Desk Phone" />
              <TextInput name="email" label="Official Email" />
              <TextInput name="website" label="Website URL" />
              <TextInput name="gstin" label="GSTIN Number" />
              <TextInput name="upiId" label="UPI VPA ID (for QR Payments)" helper="e.g. hotelname@okaxis" />
              <TextInput name="taxPercent" label="GST / VAT % on bills" type="number" helper="e.g. 12% for hotel rooms" />
            </Box>
            <TextInput name="address" label="Property Address" multiline rows={2} />
            <FormControlLabel
              control={<Switch checked={values.autoCleaning} onChange={(e) => setFieldValue("autoCleaning", e.target.checked)} />}
              label="Check-out ke baad room ko 'Cleaning' me daalo"
            />
            <Box className="flex justify-end pt-2"><UISubmitButton text="Save settings" loading={isLoading} /></Box>
          </Form>
        )}
      </Formik>
    </SectionBox>
  );
};

export default HotelInfo;
