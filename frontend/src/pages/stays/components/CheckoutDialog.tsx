import { useEffect, useMemo, useState } from "react";
import { Box, Button } from "@mui/material";
import toast from "react-hot-toast";
import UiDialog from "../../../components/ui/models/UiDialog";
import UISubmitButton from "../../../components/ui/buttons/UISubmitButton";
import CheckoutChargesPanel from "./CheckoutChargesPanel";
import CheckoutBillSummary from "./CheckoutBillSummary";
import { useCheckOutMutation } from "../../../store/services/stay/staySlice";
import { useGetRatePlansQuery } from "../../../store/services/rate-plan/ratePlanSlice";
import { useGetRoomsQuery } from "../../../store/services/room/roomSlice";
import { useGetSettingsQuery } from "../../../store/services/settings/settingsSlice";
import { calculateBill, computeExpectedCheckOut } from "../../../utils/helper/billing";
import { getErrorMessage, uid } from "../../../utils/helper/helper";
import { fromLocalInput, toLocalInput } from "../../../utils/date/dateUtils";
import type { ExtraCharge, PaymentMode, Stay } from "../../../utils/interfaces/Interface";
import { printReceipt } from "../../../components/print/printPdf/PrintReceipt";

interface CheckoutDialogProps { stay: Stay | null; onClose: () => void; onDone?: (stay: Stay) => void; }

export default function CheckoutDialog({ stay, onClose, onDone }: CheckoutDialogProps) {
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

  const room = rooms.find((item) => item.id === stay?.roomId);
  const roomPlans = useMemo(
    () => plans.filter((plan) => plan.id === stay?.plan.id || (
      plan.isActive && (plan.roomTypeIds.length === 0 || (room && plan.roomTypeIds.includes(room.roomTypeId)))
    )),
    [plans, stay, room],
  );
  const activePlan = plans.find((plan) => plan.id === planId) ?? stay?.plan;
  const bill = useMemo(() => {
    if (!stay || !activePlan || !checkOutAt) return null;
    const expected = activePlan.id === stay.plan.id ? stay.expectedCheckOutAt : computeExpectedCheckOut(activePlan, stay.checkInAt);
    return calculateBill({ plan: activePlan, checkInAt: stay.checkInAt, checkOutAt: fromLocalInput(checkOutAt), expectedCheckOutAt: expected, extraCharges: extras, discount: Number(discount) || 0, taxPercent: Number(taxPercent) || 0 });
  }, [stay, activePlan, checkOutAt, extras, discount, taxPercent]);

  if (!stay || !bill) return null;
  const balance = Math.max(0, bill.total - stay.advanceAmount);
  const refund = Math.max(0, stay.advanceAmount - bill.total);
  const receivedValue = received === null ? balance : Number(received) || 0;
  const due = Math.max(0, balance - receivedValue);

  const addExtra = () => {
    const value = Number(amount);
    if (!label.trim() || !(value > 0)) return toast.error("Charge ka naam aur amount daalo");
    setExtras((current) => [...current, { id: uid(), label: label.trim(), amount: value }]);
    setLabel(""); setAmount("");
  };

  const submit = async (print: boolean) => {
    try {
      const result = await checkOut({ id: stay.id, checkOutAt: fromLocalInput(checkOutAt), planId, extraCharges: extras, discount: Number(discount) || 0, taxPercent: Number(taxPercent) || 0, amountReceived: receivedValue, paymentMode: mode, autoCleaning: settings?.autoCleaning ?? true }).unwrap();
      toast.success(`Room ${stay.roomNumber} checked out`);
      if (print && settings) printReceipt(result, settings);
      onDone?.(result);
      onClose();
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  return <UiDialog open onClose={onClose} maxWidth="md" title={`Check out · Room ${stay.roomNumber} · ${stay.guestName}`} actions={<><Button onClick={onClose} color="inherit">Cancel</Button><UISubmitButton type="button" variant="outlined" text="Check out & print" loading={isLoading} onClick={() => submit(true)} /><UISubmitButton type="button" text="Check out" loading={isLoading} onClick={() => submit(false)} /></>}>
    <Box className="grid gap-5 md:grid-cols-2">
      <CheckoutChargesPanel checkOutAt={checkOutAt} setCheckOutAt={setCheckOutAt} plans={roomPlans} planId={planId} setPlanId={setPlanId} extras={extras} setExtras={setExtras} label={label} setLabel={setLabel} amount={amount} setAmount={setAmount} discount={discount} setDiscount={setDiscount} taxPercent={taxPercent} setTaxPercent={setTaxPercent} onAddExtra={addExtra} />
      <CheckoutBillSummary stay={stay} bill={bill} extras={extras} balance={balance} refund={refund} due={due} received={received} setReceived={setReceived} mode={mode} setMode={setMode} />
    </Box>
  </UiDialog>;
}
