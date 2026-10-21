import { useState } from "react";
import { Box, Dialog } from "@mui/material";
import { IdCard } from "lucide-react";
import { useGetImageQuery } from "../../../store/services/guest/guestSlice";

interface Props {
  /** Stored image key, or a data URL (not yet saved). */
  value?: string;
  className?: string;
  zoomable?: boolean;
}

const IdImage = ({ value, className = "h-20 w-32", zoomable = true }: Props) => {
  const [open, setOpen] = useState(false);
  const isData = !!value && value.startsWith("data:");
  const { data } = useGetImageQuery(value ?? "", { skip: !value || isData });
  const src = isData ? value : data;

  if (!src) {
    return (
      <Box className={`flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 ${className}`}>
        <IdCard className="size-6" />
      </Box>
    );
  }

  return (
    <>
      <img
        src={src}
        alt="ID proof"
        onClick={() => zoomable && setOpen(true)}
        className={`rounded-lg border border-gray-200 object-cover ${zoomable ? "cursor-zoom-in" : ""} ${className}`}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <img src={src} alt="ID proof" className="max-h-[85vh] w-auto" />
      </Dialog>
    </>
  );
};

export default IdImage;
