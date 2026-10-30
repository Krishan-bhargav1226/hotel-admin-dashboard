import { useRef, useState } from "react";
import { Box } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Upload, Loader2 } from "lucide-react";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { TextInput } from "../../../components/forms/BasicTextFields";
import { SearchableSelectDropdown } from "../../../components/forms/SelectDropdown";
import { uploadImageFile } from "../../../utils/helper/imageUpload";
import { getErrorMessage } from "../../../utils/helper/helper";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageFile(file);
      setFieldValue("image", url);
      toast.success("Room type photo uploaded successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
      if (event.target) event.target.value = "";
    }
  };

  return <Formik<RoomTypeFormValues> enableReinitialize initialValues={{
    name: item?.name ?? "", category: item?.category ?? "COUPLE", description: item?.description ?? "", image: item?.image ?? "",
    bedConfig: item?.bedConfig ?? "", maxGuests: item?.maxGuests ?? 2, sizeSqFt: item?.sizeSqFt ?? 320,
    basePrice: item?.basePrice ?? 2500, badge: item?.badge ?? "", suitableFor: item?.suitableFor ?? "",
  }} validationSchema={Yup.object({ name: Yup.string().trim().required("Name is required") })} onSubmit={onSubmit}>
    {({ values, setFieldValue }) => <Form className="space-y-3">
      <RoomTypePreview values={values} id={item?.id} />
      <TextInput name="name" label="Room Type Name" required autoFocus placeholder="e.g. Deluxe Garden Villa" />
      <SearchableSelectDropdown name="category" label="Guest Category Profile" required options={CATEGORY_OPTIONS} />
      <TextInput name="suitableFor" label="Target Guest Label" placeholder="e.g. Couples & Romantic Getaways" />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-700">Photo</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, setFieldValue)}
          />
          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
          >
            {uploadingImage ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploadingImage ? "Uploading..." : "Upload from Computer"}
          </button>
        </div>
        <TextInput name="image" label="" placeholder="Paste photo URL or leave blank to use luxury curated photo" />
      </div>
      <Box className="grid grid-cols-2 gap-3"><TextInput name="bedConfig" label="Bed Layout" placeholder="e.g. 1 King Bed" /><TextInput name="maxGuests" label="Max Guests" type="number" /></Box>
      <Box className="grid grid-cols-2 gap-3"><TextInput name="sizeSqFt" label="Size (sq.ft)" type="number" /><TextInput name="basePrice" label="Base Rate / Night (₹)" type="number" /></Box>
      <TextInput name="badge" label="Feature Pill / Badge" placeholder="e.g. Balcony with View" />
      <TextInput name="description" label="Description" multiline rows={2} />
      <Box className="flex justify-end pt-2"><UISubmitButton text="Save Room Type" loading={saving} /></Box>
    </Form>}
  </Formik>;
}
