import { useEffect, useMemo, useState } from "react";
import { Box, Button, MenuItem, Select, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import UiDialog from "../../../components/ui/models/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import { useCheckOutMutation } from "../../../store/services/stay/staySlice";
import { useGetRatePlansQuery } from "../../../store/services/rate-plan/ratePlanSlice";
import { useGetRoomsQuery } from "../../../store/services/room/roomSlice";
import { useGetSettingsQuery } from "../../../store/services/settings/settingsSlice";
import { calculateBill, computeExpectedCheckOut, describePlan } from "../../../utils/helper/billing";
import { formatCurrency, formatDuration, getErrorMessage, uid } from "../../../utils/helper/helper";
import { fromLocalInput, toLocalInput } from "../../../utils/date/dateUtils";
import { PAYMENT_MODES } from "../../../utils/helper/constants";
import type { ExtraCharge, PaymentMode, Stay } from "../../../utils/interfaces/Interface";
import { printReceipt } from "../../../components/print/printPdf/PrintReceipt";

interface Props {
  stay: Stay | null;
  onClose: () => void;
  onDone?: (stay: Stay) => void;
}

const Line = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <Box className={`flex justify-between py-0.5 text-sm ${bold ? "font-bold" : ""}`}>
    <span>{label}</span>
    <span>{value}</span>
  </Box>
);

/** Final bill: change plan / time, add extras, discount, collect payment, check out. */
const CheckoutDialog = ({ stay, onClose, onDone }: Props) => {
  const { data: plans = [] } = useGetRatePlansQuery();
  const { data: rooms = [] } = useGetRoomsQuery();
  const { data: settings } = useGetSettingsQuery();
  const [checkOut, { isLoading }] = useCheckOutMutation();

  const [checkOutAt, setCheckOutAt] = useState("");
  const [planId, setPlanId] = useState("");
  const [extras, setExtras] = useState<ExtraCharge[]>([]);
  const [discount, setDiscount] = useState("");
  const [taxPercent, setTaxPercent] = useState("0");
  const [received, setReceived] = useState<string | null>(null);
  const [mode, setMode] = useState<PaymentMode>("CASH");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!stay) return;
    setCheckOutAt(toLocalInput(new Date().toISOString()));
    setPlanId(stay.plan.id);
    setExtras(stay.extraCharges);
    setDiscount(stay.discount ? String(stay.discount) : "");
    setTaxPercent(String(stay.taxPercent));
    setReceived(null);
    setMode("CASH");
    setLabel("");
    setAmount("");
  }, [stay]);

  const room = rooms.find((r) => r.id === stay?.roomId);
  const roomPlans = useMemo(
    () =>
      plans.filter(
        (p) =>
          p.id === stay?.plan.id ||
          (p.isActive && (p.roomTypeIds.length === 0 || (room && p.roomTypeIds.includes(room.roomTypeId))))
      ),
    [plans, stay, room]
  );

  const activePlan = plans.find((p) => p.id === planId) ?? stay?.plan;
  const bill = useMemo(() => {
    if (!stay || !activePlan || !checkOutAt) return null;
    const expected =
      activePlan.id === stay.plan.id
        ? stay.expectedCheckOutAt
        : computeExpectedCheckOut(activePlan, stay.checkInAt);
    return calculateBill({
      plan: activePlan,
      checkInAt: stay.checkInAt,
      checkOutAt: fromLocalInput(checkOutAt),
      expectedCheckOutAt: expected,
      extraCharges: extras,
      discount: Number(discount) || 0,
      taxPercent: Number(taxPercent) || 0,
    });
  }, [stay, activePlan, checkOutAt, extras, discount, taxPercent]);

  if (!stay || !bill) return null;

  const balance = Math.max(0, bill.total - stay.advanceAmount);
  const refund = Math.max(0, stay.advanceAmount - bill.total);
  const receivedValue = received === null ? balance : Number(received) || 0;
  const due = Math.max(0, balance - receivedValue);

  const addExtra = () => {
    const amt = Number(amount);
    if (!label.trim() || !(amt > 0)) return toast.error("Charge ka naam aur amount daalo");
    setExtras((e) => [...e, { id: uid(), label: label.trim(), amount: amt }]);
    setLabel("");
    setAmount("");
  };

  const submit = async (print: boolean) => {
    try {
      const result = await checkOut({
        id: stay.id,
        checkOutAt: fromLocalInput(checkOutAt),
        planId,
        extraCharges: extras,
        discount: Number(discount) || 0,
        taxPercent: Number(taxPercent) || 0,
        amountReceived: receivedValue,
        paymentMode: mode,
        autoCleaning: settings?.autoCleaning ?? true,
      }).unwrap();
      toast.success(`Room ${stay.roomNumber} checked out`);
      if (print && settings) printReceipt(result, settings);
      onDone?.(result);
      onClose();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <UiDialog
      open
      onClose={onClose}
      maxWidth="md"
      title={`Check out · Room ${stay.roomNumber} · ${stay.guestName}`}
      actions={
        <>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <UISubmitButton type="button" variant="outlined" text="Check out & print" loading={isLoading} onClick={() => submit(true)} />
          <UISubmitButton type="button" text="Check out" loading={isLoading} onClick={() => submit(false)} />
        </>
      }
    >
      <Box className="grid gap-5 md:grid-cols-2">
        <Box className="space-y-3">
          <TextField
            size="small" fullWidth type="datetime-local" label="Check-out time" value={checkOutAt}
            onChange={(e) => setCheckOutAt(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box>
            <Typography variant="caption" className="text-gray-500">Rate plan</Typography>
            <Select size="small" fullWidth value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {roomPlans.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name} — {describePlan(p)}</MenuItem>
              ))}
            </Select>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700}>Extra charges</Typography>
            {extras.map((c) => (
              <Box key={c.id} className="flex items-center justify-between py-0.5 text-sm">
                <span>{c.label}</span>
                <span className="flex items-center gap-2">
                  {formatCurrency(c.amount)}
                  <MdDelete className="cursor-pointer text-red-500" onClick={() => setExtras((e) => e.filter((x) => x.id !== c.id))} />
                </span>
              </Box>
            ))}
            <Box className="mt-1 flex gap-1.5">
              <TextField size="small" label="Item (food, laundry…)" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth />
              <TextField size="small" label="₹" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ width: 100 }} />
              <Button size="small" variant="outlined" onClick={addExtra}>Add</Button>
            </Box>
          </Box>

          <Box className="flex gap-2">
            <TextField size="small" fullWidth type="number" label="Discount ₹" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            <TextField size="small" fullWidth type="number" label="GST %" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
          </Box>
        </Box>

        <Box className="rounded-xl bg-gray-50 p-4">
          <Typography variant="caption" className="text-gray-500">
            Stay time {formatDuration(bill.elapsedMinutes)}
          </Typography>
          <Line label={bill.baseLabel} value={formatCurrency(bill.baseAmount)} />
          {bill.overtimeHours > 0 && (
            <Line label={`Extra time · ${bill.overtimeHours} hr`} value={formatCurrency(bill.overtimeAmount)} />
          )}
          {extras.map((c) => <Line key={c.id} label={c.label} value={formatCurrency(c.amount)} />)}
          {bill.discount > 0 && <Line label="Discount" value={`- ${formatCurrency(bill.discount)}`} />}
          {bill.taxAmount > 0 && <Line label={`GST ${bill.taxPercent}%`} value={formatCurrency(bill.taxAmount)} />}
          <hr className="my-2" />
          <Line label="Total" value={formatCurrency(bill.total)} bold />
          {stay.advanceAmount > 0 && <Line label="Advance paid" value={`- ${formatCurrency(stay.advanceAmount)}`} />}
          <Line label={refund > 0 ? "Refund to guest" : "Balance to collect"} value={formatCurrency(refund > 0 ? refund : balance)} bold />

          <Box className="mt-3 space-y-2">
            <TextField
              size="small" fullWidth type="number" label="Amount received now ₹"
              value={received ?? String(balance)} onChange={(e) => setReceived(e.target.value)}
              helperText={due > 0 ? `${formatCurrency(due)} due rahega` : " "}
            />
            <ToggleButtonGroup size="small" exclusive value={mode} onChange={(_e, v) => v && setMode(v)} fullWidth>
              {PAYMENT_MODES.map((m) => <ToggleButton key={m.id} value={m.id}>{m.name}</ToggleButton>)}
            </ToggleButtonGroup>
          </Box>
          <Typography variant="caption" className="mt-2 block text-gray-500">
            Check-in {dayjs(stay.checkInAt).format("DD MMM, hh:mm A")}
          </Typography>
        </Box>
      </Box>
    </UiDialog>
  );
};

export default CheckoutDialog;
