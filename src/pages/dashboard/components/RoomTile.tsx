import { Button } from "@mui/material";
import dayjs from "dayjs";
import { MdRoomService, MdLogin, MdLogout, MdCleaningServices, MdBuild, MdAccessTime } from "react-icons/md";
import type { Room, Stay } from "../../../utils/interfaces/Interface";
import { calculateBill } from "../../../utils/helper/billing";
import { formatCurrency, formatDuration } from "../../../utils/helper/helper";
import { formatTime } from "../../../utils/date/dateUtils";

interface Props {
  room: Room;
  roomTypeName: string;
  stay?: Stay;
  now: number;
  onCheckIn: () => void;
  onOpenStay: () => void;
  onCheckOut: () => void;
  onOrderService?: () => void;
  onSetStatus: (status: "AVAILABLE" | "CLEANING" | "MAINTENANCE") => void;
}

export default function RoomTile({
  room,
  roomTypeName,
  stay,
  now,
  onCheckIn,
  onOpenStay,
  onCheckOut,
  onOrderService,
  onSetStatus,
}: Props) {
  const nowIso = new Date(now).toISOString();

  const running =
    stay && stay.status === "ACTIVE"
      ? calculateBill({
          plan: stay.plan,
          checkInAt: stay.checkInAt,
          checkOutAt: nowIso,
          expectedCheckOutAt: stay.expectedCheckOutAt,
          extraCharges: stay.extraCharges,
          discount: stay.discount,
          taxPercent: stay.taxPercent,
        })
      : null;

  const overdueMin =
    stay?.expectedCheckOutAt ? dayjs(now).diff(dayjs(stay.expectedCheckOutAt), "minute") : 0;
  const isOverdue = !!stay?.expectedCheckOutAt && overdueMin > (stay?.plan.graceMinutes ?? 0);

  // Taste-skill status pills: soft pastels, micro status dots, crisp typography
  const getStatusBadge = () => {
    switch (room.status) {
      case "AVAILABLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case "OCCUPIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Occupied
          </span>
        );
      case "CLEANING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Cleaning
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative flex min-h-[190px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      {/* Top Header: Room Number, Floor & Status Pill */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold tracking-tight text-slate-900">
              {room.number}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {room.floor}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-0.5 text-xs font-medium text-slate-500 truncate max-w-[200px]">
          {roomTypeName}
        </div>
      </div>

      {/* Body: Guest Status or Room Readiness */}
      <div className="my-2.5 flex-1">
        {stay && running ? (
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {stay.guestName}
              </span>
              <span className="font-mono text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                {stay.stayNo}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <MdAccessTime size={13} className="text-slate-400 shrink-0" />
              <span>{stay.plan.name}</span>
              <span className="text-slate-300">·</span>
              <span>In since {formatTime(stay.checkInAt)}</span>
            </div>

            {/* Tabular Folio Box */}
            <div className="mt-2 flex items-baseline justify-between rounded-xl bg-slate-50/80 px-2.5 py-2 border border-slate-100/90">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Elapsed
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {formatDuration(running.elapsedMinutes)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Running Folio
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {formatCurrency(running.total)}
                </span>
              </div>
            </div>

            {/* Overdue or Expected Check-Out */}
            {isOverdue ? (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/50">
                <span>⚠️ Overdue by {formatDuration(overdueMin)}</span>
              </div>
            ) : stay.expectedCheckOutAt ? (
              <div className="mt-1.5 text-[11px] text-slate-400">
                Check-out: <span className="font-medium text-slate-600">{formatTime(stay.expectedCheckOutAt)}</span>
              </div>
            ) : null}
          </div>
        ) : room.status === "AVAILABLE" ? (
          <div className="py-2.5 flex flex-col justify-center h-full">
            <span className="text-xs font-medium text-slate-600">
              {room.notes || "Ready for guest arrival"}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Certified sanitized · Key card ready
            </span>
          </div>
        ) : room.status === "CLEANING" ? (
          <div className="py-2.5 flex flex-col justify-center h-full">
            <span className="text-xs font-medium text-amber-800">
              Housekeeping Turnover
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Linen change & sanitization in progress
            </span>
          </div>
        ) : (
          <div className="py-2.5 flex flex-col justify-center h-full">
            <span className="text-xs font-medium text-slate-700">
              Under Maintenance Inspection
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {room.notes || "Technical service in progress"}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer: Tactile Micro-Interactions */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
        {room.status === "AVAILABLE" && (
          <>
            <button
              type="button"
              onClick={onCheckIn}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
            >
              <MdLogin size={14} />
              <span>Check In</span>
            </button>
            <button
              type="button"
              onClick={() => onSetStatus("CLEANING")}
              title="Send to Cleaning"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all cursor-pointer"
            >
              <MdCleaningServices size={15} />
            </button>
          </>
        )}

        {room.status === "OCCUPIED" && (
          <>
            <button
              type="button"
              onClick={onOpenStay}
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer"
            >
              Folio
            </button>
            {onOrderService && (
              <button
                type="button"
                onClick={onOrderService}
                title="Room Service POS"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:scale-[0.98] transition-all cursor-pointer"
              >
                <MdRoomService size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onCheckOut}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
            >
              <MdLogout size={13} />
              <span>Check Out</span>
            </button>
          </>
        )}

        {room.status === "CLEANING" && (
          <Button
            size="small"
            variant="contained"
            color="success"
            fullWidth
            startIcon={<MdCleaningServices size={14} />}
            onClick={() => onSetStatus("AVAILABLE")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.75rem",
              borderRadius: "8px",
              py: 0.6,
            }}
          >
            Mark Clean & Ready
          </Button>
        )}

        {room.status === "MAINTENANCE" && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            fullWidth
            startIcon={<MdBuild size={14} />}
            onClick={() => onSetStatus("AVAILABLE")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.75rem",
              borderRadius: "8px",
              py: 0.6,
            }}
          >
            Restore to Service
          </Button>
        )}
      </div>
    </div>
  );
}
