import { useFormikContext } from "formik";
import { CheckCircle2, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { describePlan } from "../../../utils/helper/billing";
import { formatCurrency } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import { partyTypeLabel } from "../../../utils/helper/stayRooms";
import type { BillBreakdown, RatePlan, Room, RoomType } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";

interface CheckInSummaryProps {
  selectedRooms: Room[];
  roomTypes: RoomType[];
  activePlan?: RatePlan;
  expectedCheckOut: string | null;
  estimate: BillBreakdown | null;
  isLoading: boolean;
  onOpenReview?: () => void;
}

export default function CheckInSummary({
  selectedRooms,
  roomTypes,
  activePlan,
  expectedCheckOut,
  estimate,
  isLoading,
  onOpenReview,
}: CheckInSummaryProps) {
  const { values } = useFormikContext<CheckInFormValues>();
  const advance = Number(values.advanceAmount) || 0;
  const balance = estimate ? Math.max(0, estimate.total - advance) : 0;
  const primaryName = values.members?.[0]?.fullName?.trim() || "—";

  const roomLabel = selectedRooms.length
    ? selectedRooms
        .map((room) => {
          const type = roomTypes.find((item) => item.id === room.roomTypeId);
          return type ? `${room.number} · ${type.name}` : room.number;
        })
        .join(", ")
    : "—";

  // Check if every person has mandatory ID file uploaded
  const allIdsUploaded =
    values.members.length > 0 &&
    values.members.every((m) => Boolean(m.idDocumentId || m.isExistingUploaded));

  const canSubmit =
    Boolean(values.phone) &&
    values.members.length > 0 &&
    values.roomIds.length > 0 &&
    Boolean(values.planId) &&
    allIdsUploaded &&
    !isLoading;

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 lg:sticky lg:top-20 dark:border-slate-700 dark:bg-[var(--card)]">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Ready to check in</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">Guest</dt>
          <dd className="truncate font-medium text-slate-900 dark:text-slate-50">{primaryName}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">Party</dt>
          <dd className="truncate text-right font-medium text-slate-900 dark:text-slate-50">
            {partyTypeLabel(values.partyType)} · {values.members.length} {values.members.length === 1 ? "guest" : "guests"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">ID Status</dt>
          <dd className="truncate text-right font-medium">
            {allIdsUploaded ? (
              <span className="text-emerald-700 dark:text-emerald-400">All IDs uploaded</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400">ID file required</span>
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">Room{selectedRooms.length > 1 ? "s" : ""}</dt>
          <dd className="truncate text-right font-medium text-slate-900 dark:text-slate-50">{roomLabel}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">Stay</dt>
          <dd className="truncate text-right font-medium text-slate-900 dark:text-slate-50">
            {activePlan ? describePlan(activePlan) : "—"}
            {selectedRooms.length > 1 ? ` × ${selectedRooms.length}` : ""}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-slate-500 dark:text-slate-400">Out</dt>
          <dd className="text-right font-medium text-slate-900 dark:text-slate-50">
            {expectedCheckOut ? formatDateTime(expectedCheckOut) : activePlan?.kind === "HOURLY" ? "By the hour" : "—"}
          </dd>
        </div>
        {estimate ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-slate-500 dark:text-slate-400">{activePlan?.kind === "HOURLY" ? "Minimum charge" : "Room charge"}</dt>
              <dd className="font-medium tabular-nums text-slate-900 dark:text-slate-50">{formatCurrency(estimate.baseAmount)}</dd>
            </div>
            {estimate.taxAmount > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">GST {estimate.taxPercent}%</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-slate-50">{formatCurrency(estimate.taxAmount)}</dd>
              </div>
            ) : null}
            {advance > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">Advance · {values.advanceMode}</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-slate-50">− {formatCurrency(advance)}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-700">
              <dt className="font-medium text-slate-700 dark:text-slate-200">To collect now</dt>
              <dd className="text-base font-bold tabular-nums text-slate-900 dark:text-slate-50">{formatCurrency(balance)}</dd>
            </div>
          </>
        ) : null}
      </dl>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {activePlan?.kind === "HOURLY"
          ? "Hourly stays keep running. The final bill is calculated at check-out."
          : "Extra hours, extra charges, and discounts are added at check-out."}
      </p>

      {/* Review & Confirm Button */}
      {onOpenReview && (
        <button
          type="button"
          onClick={onOpenReview}
          disabled={!canSubmit}
          className="mt-3 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-4 text-xs font-bold text-brand-900 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
        >
          <Eye className="size-4" />
          <span>Review Guest & IDs</span>
        </button>
      )}

      {/* Primary Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="mt-2.5 w-full font-bold"
        loading={isLoading}
        disabled={!canSubmit}
      >
        <CheckCircle2 className="size-4 mr-1.5" />
        <span>Confirm Check in</span>
      </Button>

      {!allIdsUploaded && (
        <p className="mt-2 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
          * Har person ka ID document upload karna zaroori hai.
        </p>
      )}

      <p className="mt-2 text-center text-[11px] text-slate-500">Enter moves to the next field. Ctrl+Enter checks in.</p>
    </aside>
  );
}
