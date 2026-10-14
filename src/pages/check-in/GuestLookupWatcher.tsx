import { useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import { MdPerson, MdStar, MdWarning, MdGroupAdd } from "react-icons/md";
import { useGetGuestByPhoneQuery } from "../../store/services/guest/guestSlice";
import { formatFullDate } from "../../utils/date/dateUtils";
import { formatCurrency } from "../../utils/helper/helper";
import { idTypeName } from "../../utils/helper/constants";
import type { CheckInFormValues } from "./CheckIn";

/**
 * Repeat guest magic: 10-digit phone type hote hi pichhli visit ki ID, naam aur
 * address form me aa jaata hai.
 */
const GuestLookupWatcher = () => {
  const { values, setValues } = useFormikContext<CheckInFormValues>();
  const ready = values.phone.length === 10;
  const { data, isFetching } = useGetGuestByPhoneQuery(values.phone, { skip: !ready });
  const appliedFor = useRef("");

  useEffect(() => {
    if (!ready || isFetching || !data) return;
    if (appliedFor.current === values.phone) return;
    appliedFor.current = values.phone;
    setValues((v) => ({
      ...v,
      name: data.guest.name,
      idType: data.guest.idType,
      idNumber: data.guest.idNumber,
      idImage: data.guest.idImage,
      address: data.guest.address,
    }));
  }, [ready, isFetching, data, values.phone, setValues]);

  useEffect(() => {
    if (!ready) appliedFor.current = "";
  }, [ready]);

  if (!ready || isFetching) return null;

  if (!data) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 text-xs text-slate-600">
        <MdPerson className="text-slate-400 shrink-0" size={18} />
        <div>
          <span className="font-semibold text-slate-800">New Guest Profile:</span>{" "}
          Enter full name and government ID. Information will be securely saved for instant future 1-click check-ins.
        </div>
      </div>
    );
  }

  const last = data.lastStay;
  return (
    <div className="mb-4 space-y-2.5">
      {/* Returning VIP Guest Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3 text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <MdStar size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-900">Returning Guest Profile Recognized</span>
              <span className="text-[10px] font-semibold bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded">
                {data.visits} {data.visits === 1 ? "Stay" : "Stays"}
              </span>
            </div>
            <div className="text-[11px] text-emerald-800/90 mt-0.5">
              Total Spent: <strong className="font-mono">{formatCurrency(data.totalSpent)}</strong>
              {last ? ` · Last visit on ${formatFullDate(last.checkInAt)} (Room ${last.roomNumber})` : ""}
              {" · "}{idTypeName(data.guest.idType)} KYC auto-filled.
            </div>
          </div>
        </div>

        {last && last.companions.length > 0 && values.companions.every((c) => !c.name && !c.idNumber) && (
          <button
            type="button"
            onClick={() => setValues((v) => ({ ...v, companions: last.companions.map((c) => ({ ...c })) }))}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-50 active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <MdGroupAdd size={13} />
            <span>Add Previous Co-Guests ({last.companions.length})</span>
          </button>
        )}
      </div>

      {data.guest.isFlagged && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
          <MdWarning className="text-rose-600 shrink-0" size={18} />
          <div>
            <strong className="font-bold">Front Desk Alert:</strong> Guest has a prior flag note
            {data.guest.flagReason ? `: "${data.guest.flagReason}"` : "."} Check with Manager before issuing key.
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestLookupWatcher;
