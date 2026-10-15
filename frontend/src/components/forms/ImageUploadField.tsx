import { useRef } from "react";
import { Box, Button } from "@mui/material";
import { useField } from "formik";
import toast from "react-hot-toast";
import { MdCameraAlt } from "react-icons/md";
import IdImage from "../ui/image/IdImage";
import { compressImage } from "../../utils/helper/image";

interface Props {
  name: string;
  label?: string;
}

/** ID photo picker — opens the camera on phones/tablets, file picker on PC. */
const ImageUploadField = ({ name, label = "ID photo" }: Props) => {
  const [field, , helpers] = useField<string>(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      helpers.setValue(await compressImage(file));
    } catch {
      toast.error("Photo read nahi ho payi, dobara try karo");
    }
  };

  return (
    <Box className="mb-2">
      <p className="mb-1 text-xs font-medium text-gray-600">{label}</p>
      <Box className="flex items-center gap-3">
        <IdImage value={field.value} className="h-16 w-24" />
        <Box className="flex flex-col gap-1">
          <Button
            size="small"
            variant="outlined"
            startIcon={<MdCameraAlt />}
            onClick={() => inputRef.current?.click()}
          >
            {field.value ? "Change photo" : "Add photo"}
          </Button>
          {field.value && (
            <Button size="small" color="error" onClick={() => helpers.setValue("")}>
              Remove
            </Button>
          )}
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </Box>
    </Box>
  );
};

export default ImageUploadField;
