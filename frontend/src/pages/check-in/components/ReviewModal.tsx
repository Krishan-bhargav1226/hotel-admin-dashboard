import { CheckCircle2, FileText, Loader2, User, X } from "lucide-react";
import { formatCurrency } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import { maskIdNumber } from "../../../utils/checkin/idValidators";
import type { BillBreakdown, RatePlan, Room, RoomType } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  values: CheckInFormValues;
  selectedRooms: Room[];
  roomTypes: RoomType[];
  activePlan?: RatePlan;
  expectedCheckOut: string | null;
  estimate: BillBreakdown | null;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  values,
  selectedRooms,
  roomTypes,
  activePlan,
  expectedCheckOut,
  estimate,
}: ReviewModalProps) {
  if (!isOpen) return null;

  const advance = Number(values.advanceAmount) || 0;
  const balance = estimate ? Math.max(0, estimate.total - advance) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-[var(--card)] dark:border dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              Final Step · Verification
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Check-in Review & Confirm</h2>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          {/* Guest Identity Overview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-brand-700 px-2.5 py-0.5 text-xs font-bold text-white">
                  {values.partyType}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  +91 {values.phone}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {values.members.length} {values.members.length === 1 ? "Person" : "Persons"}
              </span>
            </div>

            {/* Members List with Thumbnails & Masked IDs */}
            <div className="mt-3.5 space-y-2.5 border-t border-slate-200/80 pt-3 dark:border-slate-800">
              {values.members.map((member, i) => {
                const isPdf = member.idDocumentFileName?.toLowerCase().endsWith(".pdf");
                const masked = maskIdNumber(member.idType, member.idNumber);

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/60 bg-white p-2.5 dark:border-slate-700/60 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      {/* Photo Thumbnail */}
                      <div className="size-11 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
                        {isPdf ? (
                          <div className="flex size-full items-center justify-center text-slate-500">
                            <FileText className="size-5 text-emerald-600" />
                          </div>
                        ) : member.idDocumentUrl ? (
                          <img
                            src={member.idDocumentUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-slate-400">
                            <User className="size-5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {member.fullName || "Guest"}
                          </span>
                          {member.isPrimary && (
                            <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[9px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                              Primary
                            </span>
                          )}
                          {member.dateOfBirth && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              (DOB: {member.dateOfBirth})
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{member.idType}:</span>
                          <span>{masked}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>ID Verified</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stay & Room Breakdown */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
              <span className="block text-xs font-medium text-slate-500">Room(s) Assigned</span>
              <span className="mt-1 block text-sm font-bold text-slate-900 dark:text-slate-100">
                {selectedRooms.map((r) => r.number).join(", ") || "—"}
              </span>
              <span className="text-xs text-slate-500">
                {selectedRooms
                  .map((r) => roomTypes.find((t) => t.id === r.roomTypeId)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
              <span className="block text-xs font-medium text-slate-500">Rate Plan</span>
              <span className="mt-1 block text-sm font-bold text-slate-900 dark:text-slate-100">
                {activePlan?.name || "—"}
              </span>
              <span className="text-xs text-slate-500">
                {expectedCheckOut ? `Expected out: ${formatDateTime(expectedCheckOut)}` : "Hourly billing"}
              </span>
            </div>
          </div>

          {/* Payment Summary */}
          {estimate && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial Summary</h3>
              <div className="mt-2.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Room Charge:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(estimate.baseAmount)}
                  </span>
                </div>
                {estimate.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>GST ({estimate.taxPercent}%):</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(estimate.taxAmount)}
                    </span>
                  </div>
                )}
                {advance > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>Advance Received ({values.advanceMode}):</span>
                    <span className="font-bold">− {formatCurrency(advance)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-slate-50">
                  <span>Due on Checkout:</span>
                  <span className="text-brand-800 dark:text-brand-300">{formatCurrency(balance)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Back to Edit
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Check-in...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Confirm Check-in</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
