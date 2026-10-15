import type { Dispatch, SetStateAction } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { MdDelete } from "react-icons/md";
import BoxTitle from "../../../components/ui/container/BoxTitle";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { formatCurrency } from "../../../utils/helper/helper";
import type { BillBreakdown, Stay } from "../../../utils/interfaces/Interface";

interface StayBillPanelProps {
  stay: Stay;
  bill: BillBreakdown | null;
  active: boolean;
  collecting: boolean;
  label: string;
  setLabel: Dispatch<SetStateAction<string>>;
  amount: string;
  setAmount: Dispatch<SetStateAction<string>>;
  onAddExtra: () => void;
  onRemoveExtra: (id: string) => void;
  onReceiveDue: () => void;
}

export default function StayBillPanel(props: StayBillPanelProps) {
  const { stay, bill, active, collecting, label, setLabel, amount, setAmount, onAddExtra, onRemoveExtra, onReceiveDue } = props;

  return (
    <BoxTitle title={active ? "Live Running Folio" : "Final Settled Invoice"}>
      {bill && <Box className="mt-2 rounded-lg border border-gray-200 bg-white p-3.5 text-sm shadow-xs">
        <BillRow label={bill.baseLabel} value={formatCurrency(bill.baseAmount)} />
        {bill.overtimeHours > 0 && <BillRow label={`Overtime · ${bill.overtimeHours} hrs`} value={formatCurrency(bill.overtimeAmount)} />}
        {stay.extraCharges.map((charge) => <BillRow key={charge.id} label={charge.label} value={<span className="flex items-center gap-2">{formatCurrency(charge.amount)}{active && <button type="button" className="text-red-500 hover:text-red-700" onClick={() => onRemoveExtra(charge.id)} aria-label={`Remove ${charge.label}`}><MdDelete /></button>}</span>} />)}
        {bill.discount > 0 && <BillRow label="Promotional Discount" value={`- ${formatCurrency(bill.discount)}`} />}
        {bill.taxAmount > 0 && <BillRow label={`GST / Tax (${bill.taxPercent}%)`} value={formatCurrency(bill.taxAmount)} />}
        <hr className="my-2.5 border-gray-200" />
        <Box className="flex justify-between text-lg font-black text-slate-900"><span>{active ? "Running Total" : "Total Billed"}</span><span className="text-emerald-700">{formatCurrency(bill.total)}</span></Box>
        {!active && <><BillRow label="Amount Settled" value={formatCurrency(stay.paidAmount)} />{stay.dueAmount > 0 && <Box className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3"><BillRow label="Balance Outstanding" value={formatCurrency(stay.dueAmount)} /><div className="mt-2"><UISubmitButton type="button" color="danger" text="Mark Due as Collected" loading={collecting} onClick={onReceiveDue} /></div></Box>}</>}
      </Box>}
      {active && <Box className="mt-4 rounded-lg border border-gray-200 bg-white p-3 shadow-xs">
        <Typography variant="subtitle2" fontWeight={800} className="!mb-2 text-slate-800">+ Add Extra Folio Charge (Mini-bar, Taxi, etc.)</Typography>
        <Box className="flex gap-2"><TextField size="small" label="Item / Service description" value={label} onChange={(event) => setLabel(event.target.value)} fullWidth /><TextField size="small" label="₹ Amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} sx={{ width: 110 }} /><Button variant="contained" color="primary" size="small" onClick={onAddExtra}>Add</Button></Box>
      </Box>}
    </BoxTitle>
  );
}

function BillRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <Box className="flex justify-between gap-4 py-1 text-sm"><span className="text-gray-500">{label}</span><span className="text-right font-semibold">{value}</span></Box>;
}
