import { Box, Chip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Landmark } from "lucide-react";
import SectionBox from "../../../components/ui/container/SectionBox";
import { formatCurrency } from "../../../utils/helper/helper";
import type { ShiftRegister } from "../../../utils/interfaces/Interface";

export default function ShiftRegisterList({ shifts }: { shifts: ShiftRegister[] }) {
  return (
    <SectionBox className="rounded-xl bg-white shadow-sm">
      <Typography variant="h6" fontWeight={700} className="mb-3 text-slate-900">Front Desk Cash Register Handover Logs</Typography>
      {shifts.length === 0 ? (
        <Box className="py-12 text-center text-gray-400">
          <Landmark size={48} className="mx-auto mb-2 opacity-40" />
          <Typography variant="body1" fontWeight={600}>No shift handover records yet</Typography>
          <Typography variant="caption">Record closing drawer balance during front desk staff shift changes</Typography>
        </Box>
      ) : (
        <div className="divide-y divide-gray-100">
          {shifts.map((shift) => (
            <div key={shift.id} className="py-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{dayjs(shift.shiftDate).format("DD MMM YYYY")} · {shift.shiftType} Shift</span>
                  <Chip size="small" label={`Handover by: ${shift.staffName}`} color="primary" variant="outlined" sx={{ fontSize: "0.75rem", fontWeight: 600 }} />
                </div>
                <span className="text-xs text-gray-400">Logged at {dayjs(shift.createdAt).format("DD MMM, hh:mm A")}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs sm:grid-cols-5">
                <Metric label="Opening Float" value={formatCurrency(shift.openingCash)} />
                <Metric label="+ Cash Collected" value={`+${formatCurrency(shift.cashCollected)}`} tone="text-emerald-600" />
                <Metric label="- Petty Expenses" value={`-${formatCurrency(shift.pettyExpensesPaid)}`} tone="text-rose-600" />
                <Metric label="Expected Closing" value={formatCurrency(shift.closingCashExpected)} />
                <Metric label="Actual Counted" value={`${formatCurrency(shift.actualCashCounted)}${shift.cashDifference ? ` (${shift.cashDifference > 0 ? "+" : ""}${shift.cashDifference})` : ""}`} tone={shift.cashDifference === 0 ? "text-emerald-700" : "text-amber-700"} />
              </div>
              {shift.handoverNotes && <div className="mt-2 text-xs italic text-slate-600">"Notes: {shift.handoverNotes}"</div>}
            </div>
          ))}
        </div>
      )}
    </SectionBox>
  );
}

function Metric({ label, value, tone = "text-slate-800" }: { label: string; value: string; tone?: string }) {
  return <div><div className="text-gray-500">{label}</div><div className={`font-bold ${tone}`}>{value}</div></div>;
}
