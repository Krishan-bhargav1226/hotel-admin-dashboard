import { Box } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import type { RoomType, RoomCategory } from "../../../utils/interfaces/Interface";
import RoomTypePreview from "./RoomTypePreview";

export interface RoomTypeFormValues {
  name: string;
  category: RoomCategory;
  description: string;
  image: string;
  bedConfig: string;
  maxGuests: number;
  sizeSqFt: number;
  basePrice: number;
  badge: string;
  suitableFor: string;
}

const CATEGORY_OPTIONS = [
  { id: "COUPLE", name: "Couples & Honeymooners" }, { id: "SOLO", name: "Solo / Business Executives" },
  { id: "FAMILY", name: "Families & Groups" }, { id: "ACCESSIBLE", name: "Accessible / Seniors (Ground Floor)" },
  { id: "PRESIDENTIAL", name: "VIP Luxury / Presidential Penthouse" }, { id: "BUDGET", name: "Transit & Budget Friendly" },
];

interface RoomTypeFormProps { item: RoomType | null; saving: boolean; onSubmit: (values: RoomTypeFormValues) => Promise<void>; }

export default function RoomTypeForm({ item, saving, onSubmit }: RoomTypeFormProps) {
  return <Formik<RoomTypeFormValues> enableReinitialize initialValues={{
    name: item?.name ?? "", category: item?.category ?? "COUPLE", description: item?.description ?? "", image: item?.image ?? "",
    bedConfig: item?.bedConfig ?? "", maxGuests: item?.maxGuests ?? 2, sizeSqFt: item?.sizeSqFt ?? 320,
    basePrice: item?.basePrice ?? 2500, badge: item?.badge ?? "", suitableFor: item?.suitableFor ?? "",
  }} validationSchema={Yup.object({ name: Yup.string().trim().required("Name is required") })} onSubmit={onSubmit}>
    {({ values }) => <Form className="space-y-3">
      <RoomTypePreview values={values} id={item?.id} />
      <TextInput name="name" label="Room Type Name" required autoFocus placeholder="e.g. Deluxe Garden Villa" />
      <SearchableSelectDropdown name="category" label="Guest Category Profile" required options={CATEGORY_OPTIONS} />
      <TextInput name="suitableFor" label="Target Guest Label" placeholder="e.g. Couples & Romantic Getaways" />
      <TextInput name="image" label="Photo URL (Optional)" placeholder="Leave blank to use luxury curated default photo" />
      <Box className="grid grid-cols-2 gap-3"><TextInput name="bedConfig" label="Bed Layout" placeholder="e.g. 1 King Bed" /><TextInput name="maxGuests" label="Max Guests" type="number" /></Box>
      <Box className="grid grid-cols-2 gap-3"><TextInput name="sizeSqFt" label="Size (sq.ft)" type="number" /><TextInput name="basePrice" label="Base Rate / Night (₹)" type="number" /></Box>
      <TextInput name="badge" label="Feature Pill / Badge" placeholder="e.g. Balcony with View" />
      <TextInput name="description" label="Description" multiline rows={2} />
      <Box className="flex justify-end pt-2"><UISubmitButton text="Save Room Type" loading={saving} /></Box>
    </Form>}
  </Formik>;
}
