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
import { formatCurrency, getErrorMessage, uid } from "../../../utils/helper/helper";
import { billForStayRooms, stayRoomCount } from "../../../utils/helper/stayRooms";
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
  const [activeView, setActiveView] = useState<"BILL" | "FOLIO">("BILL");

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
    const single = calculateBill({ plan: activePlan, checkInAt: stay.checkInAt, checkOutAt: fromLocalInput(checkOutAt), expectedCheckOutAt: expected, extraCharges: extras, discount: Number(discount) || 0, taxPercent: Number(taxPercent) || 0 });
    return billForStayRooms(single, stayRoomCount(stay));
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

  return <UiDialog open onClose={onClose} maxWidth="md" title={`Check out · Room ${stay.roomNumber} · ${stay.guestName}`} actions={<><Button onClick={onClose} color="inherit">Cancel</Button><Button onClick={() => setActiveView(v => v === "BILL" ? "FOLIO" : "BILL")} color="primary" variant="text">{activeView === "BILL" ? "Preview Folio Statement" : "Back to Settlement"}</Button><UISubmitButton type="button" variant="outlined" text="Check out & print" loading={isLoading} onClick={() => submit(true)} /><UISubmitButton type="button" text="Check out" loading={isLoading} onClick={() => submit(false)} /></>}>
    {activeView === "FOLIO" ? (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-800 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Official Guest Folio Statement</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{settings?.hotelName || "Hotel"}</h3>
            <p className="text-xs text-slate-500">Folio No: <strong className="font-mono text-slate-700">{stay.stayNo}</strong> · Room {stay.roomNumber}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold text-slate-900">Guest: {stay.guestName}</p>
            <p className="text-slate-500">{stay.guestPhone}</p>
            <p className="text-[11px] text-slate-400 mt-1">Check-in: {new Date(stay.checkInAt).toLocaleDateString()}</p>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-left">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2">{bill.baseLabel} ({stay.plan.name})</td>
              <td className="py-2 text-right">{formatCurrency(stay.plan.rate)}</td>
              <td className="py-2 text-right font-mono">{formatCurrency(bill.baseAmount)}</td>
            </tr>
            {bill.overtimeHours > 0 && (
              <tr>
                <td className="py-2">Overtime Extension ({bill.overtimeHours} hrs)</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right font-mono">{formatCurrency(bill.overtimeAmount)}</td>
              </tr>
            )}
            {extras.map((ex) => (
              <tr key={ex.id}>
                <td className="py-2">Service / Extra: {ex.label}</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right font-mono">{formatCurrency(ex.amount)}</td>
              </tr>
            ))}
            {bill.discount > 0 && (
              <tr className="text-emerald-700">
                <td className="py-2">Special Discount</td>
                <td className="py-2 text-right">—</td>
                <td className="py-2 text-right font-mono">- {formatCurrency(bill.discount)}</td>
              </tr>
            )}
            {bill.taxAmount > 0 && (
              <tr>
                <td className="py-2">Goods & Services Tax (GST {bill.taxPercent}%)</td>
                <td className="py-2 text-right">{bill.taxPercent}%</td>
                <td className="py-2 text-right font-mono">{formatCurrency(bill.taxAmount)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
              <td className="py-2 text-sm" colSpan={2}>Total Folio Charges</td>
              <td className="py-2 text-right text-sm font-mono">{formatCurrency(bill.total)}</td>
            </tr>
            {stay.advanceAmount > 0 && (
              <tr className="text-slate-600">
                <td className="py-1" colSpan={2}>Less: Advance Deposit ({stay.advanceMode || "CASH"})</td>
                <td className="py-1 text-right font-mono">- {formatCurrency(stay.advanceAmount)}</td>
              </tr>
            )}
            <tr className="border-t border-slate-200 font-extrabold text-brand-800">
              <td className="py-2" colSpan={2}>{refund > 0 ? "Net Refund to Guest" : "Net Balance Payable"}</td>
              <td className="py-2 text-right font-mono">{formatCurrency(refund > 0 ? refund : balance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    ) : (
      <Box className="grid gap-5 md:grid-cols-2">
        <CheckoutChargesPanel checkOutAt={checkOutAt} setCheckOutAt={setCheckOutAt} plans={roomPlans} planId={planId} setPlanId={setPlanId} extras={extras} setExtras={setExtras} label={label} setLabel={setLabel} amount={amount} setAmount={setAmount} discount={discount} setDiscount={setDiscount} taxPercent={taxPercent} setTaxPercent={setTaxPercent} onAddExtra={addExtra} />
        <CheckoutBillSummary stay={stay} bill={bill} extras={extras} balance={balance} refund={refund} due={due} received={received} setReceived={setReceived} mode={mode} setMode={setMode} />
      </Box>
    )}
  </UiDialog>;
}
