import { Box, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import dayjs from "dayjs";
import { formatCurrency, formatDuration } from "../../../utils/helper/helper";
import { PAYMENT_MODES } from "../../../utils/helper/constants";
import type { BillBreakdown, ExtraCharge, PaymentMode, Stay } from "../../../utils/interfaces/Interface";

interface CheckoutBillSummaryProps {
  stay: Stay; bill: BillBreakdown; extras: ExtraCharge[]; balance: number; refund: number; due: number;
  received: string | null; setReceived: (value: string) => void;
  mode: PaymentMode; setMode: (mode: PaymentMode) => void;
}

export default function CheckoutBillSummary({ stay, bill, extras, balance, refund, due, received, setReceived, mode, setMode }: CheckoutBillSummaryProps) {
  return <Box className="rounded-xl bg-gray-50 p-4">
    <Typography variant="caption" className="text-gray-500">Stay time {formatDuration(bill.elapsedMinutes)}</Typography>
    <Line label={bill.baseLabel} value={formatCurrency(bill.baseAmount)} />
    {bill.overtimeHours > 0 && <Line label={`Extra time · ${bill.overtimeHours} hr`} value={formatCurrency(bill.overtimeAmount)} />}
    {extras.map((charge) => <Line key={charge.id} label={charge.label} value={formatCurrency(charge.amount)} />)}
    {bill.discount > 0 && <Line label="Discount" value={`- ${formatCurrency(bill.discount)}`} />}
    {bill.taxAmount > 0 && <Line label={`GST ${bill.taxPercent}%`} value={formatCurrency(bill.taxAmount)} />}
    <hr className="my-2" /><Line label="Total" value={formatCurrency(bill.total)} bold />
    {stay.advanceAmount > 0 && <Line label="Advance paid" value={`- ${formatCurrency(stay.advanceAmount)}`} />}
    <Line label={refund > 0 ? "Refund to guest" : "Balance to collect"} value={formatCurrency(refund > 0 ? refund : balance)} bold />
    <Box className="mt-3 space-y-2"><TextField size="small" fullWidth type="number" label="Amount received now ₹" value={received ?? String(balance)} onChange={(event) => setReceived(event.target.value)} helperText={due > 0 ? `${formatCurrency(due)} due rahega` : " "} /><ToggleButtonGroup size="small" exclusive value={mode} onChange={(_event, value) => value && setMode(value)} fullWidth>{PAYMENT_MODES.map((paymentMode) => <ToggleButton key={paymentMode.id} value={paymentMode.id}>{paymentMode.name}</ToggleButton>)}</ToggleButtonGroup></Box>
    <Typography variant="caption" className="mt-2 block text-gray-500">Check-in {dayjs(stay.checkInAt).format("DD MMM, hh:mm A")}</Typography>
  </Box>;
}

function Line({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return <Box className={`flex justify-between py-0.5 text-sm ${bold ? "font-bold" : ""}`}><span>{label}</span><span>{value}</span></Box>;
}
