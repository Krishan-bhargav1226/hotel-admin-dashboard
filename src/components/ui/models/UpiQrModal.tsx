import { useState } from "react";
import { Box, Button, Typography, Chip } from "@mui/material";
import { MdContentCopy, MdCheck } from "react-icons/md";
import UiDialog from "./UiDialog";
import { formatCurrency } from "../../../utils/helper/helper";
import toast from "react-hot-toast";

interface UpiQrModalProps {
  open: boolean;
  onClose: () => void;
  hotelName: string;
  upiId?: string;
  amount: number;
  description?: string;
  stayNo?: string;
}

export default function UpiQrModal({
  open,
  onClose,
  hotelName,
  upiId = "grandhorizon@okaxis",
  amount,
  description = "Stay Bill Payment",
  stayNo,
}: UpiQrModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate UPI payment intent URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    hotelName
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `${description} ${stayNo ? `(${stayNo})` : ""}`
  )}`;

  // Use dynamic QR code image url
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    upiUri
  )}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <UiDialog open={open} onClose={onClose} title="Instant UPI Payment QR" maxWidth="xs">
      <Box className="flex flex-col items-center p-3 text-center">
        <Typography variant="body2" className="text-gray-500">
          Scan with GPay, PhonePe, Paytm, or BHIM
        </Typography>

        <Box className="my-3 rounded-2xl border-2 border-indigo-100 bg-white p-3 shadow-md">
          <img
            src={qrUrl}
            alt="UPI QR Code"
            className="h-56 w-56 object-contain"
            onError={(e) => {
              // fallback if offline
              e.currentTarget.style.display = "none";
            }}
          />
        </Box>

        <Box className="mb-2">
          <Typography variant="caption" className="text-gray-400 uppercase tracking-wider font-semibold">
            Payable Amount
          </Typography>
          <Typography variant="h4" fontWeight={900} className="text-emerald-600">
            {formatCurrency(amount)}
          </Typography>
        </Box>

        <Box className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
          <span className="font-mono">{upiId}</span>
          <Button
            size="small"
            variant="text"
            onClick={copyUpi}
            startIcon={copied ? <MdCheck className="text-emerald-600" /> : <MdContentCopy />}
            sx={{ minWidth: "auto", p: 0.5, fontSize: "0.75rem" }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </Box>

        {stayNo && (
          <Chip
            size="small"
            label={`Ref: ${stayNo}`}
            className="mt-3 bg-indigo-50 text-indigo-700 font-semibold"
          />
        )}
      </Box>
    </UiDialog>
  );
}
