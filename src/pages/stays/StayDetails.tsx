import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MdDelete, MdQrCodeScanner, MdRoomService } from "react-icons/md";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import BoxTitle from "../../components/ui/container/BoxTitle";
import StatusChip from "../../components/ui/badges/StatusChip";
import UISubmitButton from "../../components/ui/buttons/UISubmitButton";
import IdImage from "../../components/ui/image/IdImage";
import CheckoutDialog from "./components/CheckoutDialog";
import UpiQrModal from "../../components/ui/models/UpiQrModal";
import { printReceipt } from "../../components/print/printPdf/PrintReceipt";
import {
  useCollectDueMutation,
  useGetStayByIdQuery,
  useUpdateStayMutation,
} from "../../store/services/stay/staySlice";
import { useGetSettingsQuery } from "../../store/services/settings/settingsSlice";
import { useNow } from "../../hooks/useNow";
import { calculateBill, describePlan } from "../../utils/helper/billing";
import {
  buildPath,
  formatCurrency,
  formatDuration,
  getErrorMessage,
  maskId,
  uid,
} from "../../utils/helper/helper";
import { formatDateTime } from "../../utils/date/dateUtils";
import { idTypeName } from "../../utils/helper/constants";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { colors } from "../../utils/theme/colorTheme";

const Info = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <Box className="flex justify-between gap-4 py-1 text-sm">
    <span className="text-gray-500">{k}</span>
    <span className="text-right font-semibold">{v}</span>
  </Box>
);

const StayDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const now = useNow(30000);
  const { data: stay, isLoading } = useGetStayByIdQuery(id);
  const { data: settings } = useGetSettingsQuery();
  const [updateStay] = useUpdateStayMutation();
  const [collectDue, { isLoading: collecting }] = useCollectDueMutation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [upiOpen, setUpiOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  if (isLoading)
    return (
      <MainContainer>
        <Typography>Loading…</Typography>
      </MainContainer>
    );
  if (!stay) {
    return (
      <MainContainer>
        <PageTitle title="Stay not found" />
        <UISubmitButton
          type="button"
          text="Back to stays"
          onClick={() => navigate(AppEndPoints.STAY_LIST)}
        />
      </MainContainer>
    );
  }

  const active = stay.status === "ACTIVE";
  const bill = active
    ? calculateBill({
        plan: stay.plan,
        checkInAt: stay.checkInAt,
        checkOutAt: new Date(now).toISOString(),
        expectedCheckOutAt: stay.expectedCheckOutAt,
        extraCharges: stay.extraCharges,
        discount: stay.discount,
        taxPercent: stay.taxPercent,
      })
    : stay.bill;

  const currentPayable = active ? bill?.total || 0 : stay.dueAmount > 0 ? stay.dueAmount : stay.totalAmount;

  const addExtra = async () => {
    const amt = Number(amount);
    if (!label.trim() || !(amt > 0)) return toast.error("Charge ka naam aur amount daalo");
    try {
      await updateStay({
        id: stay.id,
        data: {
          extraCharges: [
            ...stay.extraCharges,
            { id: uid(), label: label.trim(), amount: amt },
          ],
        },
      }).unwrap();
      setLabel("");
      setAmount("");
      toast.success("Extra charge added to folio");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const removeExtra = async (extraId: string) => {
    try {
      await updateStay({
        id: stay.id,
        data: {
          extraCharges: stay.extraCharges.filter((c) => c.id !== extraId),
        },
      }).unwrap();
      toast.success("Charge removed");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const receiveDue = async () => {
    try {
      await collectDue({ id: stay.id, amount: stay.dueAmount }).unwrap();
      toast.success("Due payment received");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <MainContainer>
      <PageTitle
        title={`${stay.stayNo} · Room ${stay.roomNumber}`}
        subtitle={`${stay.guestName} · ${stay.guestPhone}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip
              label={active ? "In House Guest" : "Completed Stay"}
              color={active ? colors.status.occupied : colors.status.available}
            />

            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<MdQrCodeScanner />}
              onClick={() => setUpiOpen(true)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              UPI Payment QR
            </Button>

            {active && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<MdRoomService />}
                onClick={() => navigate(AppEndPoints.POS_SERVICES)}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Room Service
              </Button>
            )}

            {active ? (
              <UISubmitButton
                type="button"
                color="secondary"
                text="Check out"
                onClick={() => setCheckoutOpen(true)}
              />
            ) : (
              <UISubmitButton
                type="button"
                variant="outlined"
                text="Print Tax Invoice"
                onClick={() => settings && printReceipt(stay, settings)}
              />
            )}
          </div>
        }
      />

      <Box className="grid gap-4 lg:grid-cols-3">
        <Box className="space-y-4 lg:col-span-2">
          <BoxTitle title="Guest Folio Information">
            <Box className="mt-3 space-y-3">
              {[
                {
                  name: stay.guestName,
                  idType: stay.guestIdType,
                  idNumber: stay.guestIdNumber,
                  idImage: stay.guestIdImage,
                  primary: true,
                },
                ...stay.companions.map((c) => ({ ...c, primary: false })),
              ].map((g, i) => (
                <Box
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-xs"
                >
                  <IdImage value={g.idImage} />
                  <Box>
                    <Typography fontWeight={800} className="text-slate-900">
                      {g.name}
                      {g.primary && (
                        <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Primary Guest
                        </span>
                      )}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-0.5">
                      {idTypeName(g.idType)} · {maskId(g.idNumber)}
                    </Typography>
                    {g.primary && (
                      <Button
                        size="small"
                        onClick={() =>
                          navigate(buildPath(AppEndPoints.GUEST_DETAILS, stay.guestId))
                        }
                        sx={{ mt: 0.5, textTransform: "none", p: 0, fontSize: "0.75rem" }}
                      >
                        View Full Guest History & CRM →
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </BoxTitle>

          <BoxTitle title="Room & Tariff Snapshot">
            <Box className="mt-2 divide-y divide-gray-100 bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
              <Info k="Assigned Room" v={`Room ${stay.roomNumber} (${stay.roomTypeName})`} />
              <Info k="Tariff Plan" v={`${stay.plan.name} — ${describePlan(stay.plan)}`} />
              <Info k="Check-In Timestamp" v={formatDateTime(stay.checkInAt)} />
              {stay.expectedCheckOutAt && (
                <Info k="Expected Departure" v={formatDateTime(stay.expectedCheckOutAt)} />
              )}
              {stay.checkOutAt && (
                <Info k="Checked Out At" v={formatDateTime(stay.checkOutAt)} />
              )}
              <Info
                k="Duration"
                v={bill ? formatDuration(bill.elapsedMinutes) : "-"}
              />
              <Info
                k="Advance Paid at Check-In"
                v={`${formatCurrency(stay.advanceAmount)} (${stay.advanceMode})`}
              />
              {stay.notes && <Info k="Folio Notes" v={stay.notes} />}
            </Box>
          </BoxTitle>
        </Box>

        <Box className="space-y-4">
          <BoxTitle title={active ? "Live Running Folio" : "Final Settled Invoice"}>
            {bill && (
              <Box className="mt-2 text-sm bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs">
                <Info k={bill.baseLabel} v={formatCurrency(bill.baseAmount)} />
                {bill.overtimeHours > 0 && (
                  <Info
                    k={`Overtime · ${bill.overtimeHours} hrs`}
                    v={formatCurrency(bill.overtimeAmount)}
                  />
                )}
                {stay.extraCharges.map((c) => (
                  <Info
                    key={c.id}
                    k={c.label}
                    v={
                      <span className="flex items-center gap-2">
                        {formatCurrency(c.amount)}
                        {active && (
                          <MdDelete
                            className="cursor-pointer text-red-500 hover:text-red-700"
                            onClick={() => removeExtra(c.id)}
                            title="Remove charge"
                          />
                        )}
                      </span>
                    }
                  />
                ))}
                {bill.discount > 0 && (
                  <Info k="Promotional Discount" v={`- ${formatCurrency(bill.discount)}`} />
                )}
                {bill.taxAmount > 0 && (
                  <Info
                    k={`GST / Tax (${bill.taxPercent}%)`}
                    v={formatCurrency(bill.taxAmount)}
                  />
                )}
                <hr className="my-2.5 border-gray-200" />
                <Box className="flex justify-between text-lg font-black text-slate-900">
                  <span>{active ? "Running Total" : "Total Billed"}</span>
                  <span className="text-emerald-700">{formatCurrency(bill.total)}</span>
                </Box>
                {!active && (
                  <>
                    <Info k="Amount Settled" v={formatCurrency(stay.paidAmount)} />
                    {stay.dueAmount > 0 && (
                      <Box className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3">
                        <Info k="Balance Outstanding" v={formatCurrency(stay.dueAmount)} />
                        <div className="mt-2">
                          <UISubmitButton
                            type="button"
                            color="danger"
                            text="Mark Due as Collected"
                            loading={collecting}
                            onClick={receiveDue}
                          />
                        </div>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            {active && (
              <Box className="mt-4 bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                <Typography variant="subtitle2" fontWeight={800} className="!mb-2 text-slate-800">
                  + Add Extra Folio Charge (Mini-bar, Taxi, etc.)
                </Typography>
                <Box className="flex gap-2">
                  <TextField
                    size="small"
                    label="Item / Service description"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="₹ Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    sx={{ width: 110 }}
                  />
                  <Button variant="contained" color="primary" size="small" onClick={addExtra}>
                    Add
                  </Button>
                </Box>
              </Box>
            )}
          </BoxTitle>
        </Box>
      </Box>

      {/* Checkout Dialog */}
      <CheckoutDialog stay={checkoutOpen ? stay : null} onClose={() => setCheckoutOpen(false)} />

      {/* UPI QR Payment Modal */}
      <UpiQrModal
        open={upiOpen}
        onClose={() => setUpiOpen(false)}
        hotelName={settings?.hotelName || "Grand Horizon Hotel"}
        upiId={settings?.upiId || "grandhorizon@okaxis"}
        amount={currentPayable}
        stayNo={stay.stayNo}
        description={`Room ${stay.roomNumber} Bill`}
      />
    </MainContainer>
  );
};

export default StayDetails;
