import type { Dispatch, SetStateAction } from "react";
import { Box, Button, MenuItem, Select, TextField, Typography } from "@mui/material";
import { MdDelete } from "react-icons/md";
import { formatCurrency } from "../../../utils/helper/helper";
import { describePlan } from "../../../utils/helper/billing";
import type { ExtraCharge, RatePlan } from "../../../utils/interfaces/Interface";

interface CheckoutChargesPanelProps {
  checkOutAt: string; setCheckOutAt: Dispatch<SetStateAction<string>>;
  plans: RatePlan[]; planId: string; setPlanId: Dispatch<SetStateAction<string>>;
  extras: ExtraCharge[]; setExtras: Dispatch<SetStateAction<ExtraCharge[]>>;
  label: string; setLabel: Dispatch<SetStateAction<string>>;
  amount: string; setAmount: Dispatch<SetStateAction<string>>;
  discount: string; setDiscount: Dispatch<SetStateAction<string>>;
  taxPercent: string; setTaxPercent: Dispatch<SetStateAction<string>>;
  onAddExtra: () => void;
}

export default function CheckoutChargesPanel(props: CheckoutChargesPanelProps) {
  const { checkOutAt, setCheckOutAt, plans, planId, setPlanId, extras, setExtras, label, setLabel, amount, setAmount, discount, setDiscount, taxPercent, setTaxPercent, onAddExtra } = props;
  return <Box className="space-y-3">
    <TextField size="small" fullWidth type="datetime-local" label="Check-out time" value={checkOutAt} onChange={(event) => setCheckOutAt(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
    <Box><Typography variant="caption" className="text-gray-500">Rate plan</Typography><Select size="small" fullWidth value={planId} onChange={(event) => setPlanId(event.target.value)}>{plans.map((plan) => <MenuItem key={plan.id} value={plan.id}>{plan.name} — {describePlan(plan)}</MenuItem>)}</Select></Box>
    <Box><Typography variant="subtitle2" fontWeight={700}>Extra charges</Typography>{extras.map((charge) => <Box key={charge.id} className="flex items-center justify-between py-0.5 text-sm"><span>{charge.label}</span><span className="flex items-center gap-2">{formatCurrency(charge.amount)}<button type="button" aria-label={`Remove ${charge.label}`} className="text-red-500 hover:text-red-700" onClick={() => setExtras((current) => current.filter((item) => item.id !== charge.id))}><MdDelete /></button></span></Box>)}<Box className="mt-1 flex gap-1.5"><TextField size="small" label="Item (food, laundry…)" value={label} onChange={(event) => setLabel(event.target.value)} fullWidth /><TextField size="small" label="₹" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} sx={{ width: 100 }} /><Button size="small" variant="outlined" onClick={onAddExtra}>Add</Button></Box></Box>
    <Box className="flex gap-2"><TextField size="small" fullWidth type="number" label="Discount ₹" value={discount} onChange={(event) => setDiscount(event.target.value)} /><TextField size="small" fullWidth type="number" label="GST %" value={taxPercent} onChange={(event) => setTaxPercent(event.target.value)} /></Box>
  </Box>;
}
