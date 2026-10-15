import dayjs from "dayjs";
import { MdDeleteOutline } from "react-icons/md";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import { TableRow } from "../../../components/tables/TableRow";
import { formatCurrency } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import type { BillBreakdown, Room, Stay } from "../../../utils/interfaces/Interface";

interface StayTableRowProps {
  stay: Stay;
  rowIndex: number;
  rowNumber: number;
  room?: Room;
  bill: BillBreakdown | null;
  onView: () => void;
  onCheckout: () => void;
  onDelete: () => void;
}

export default function StayTableRow({ stay, rowIndex, rowNumber, room, bill, onView, onCheckout, onDelete }: StayTableRowProps) {
  const s = stay;
  const isActive = s.status === "ACTIVE";
  return (
<TableRow itemIndex={rowIndex}>
                  <td className="p-3 font-mono text-xs text-slate-400">
                    {rowNumber}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {s.stayNo}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-xs text-slate-900">{s.guestName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {s.guestPhone}
                      {s.companions.length > 0 && ` · +${s.companions.length}`}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <RoomPhoto
                        roomNumber={s.roomNumber}
                        roomTypeName={s.roomTypeName}
                        category={room?.category}
                        image={room?.image}
                        height="h-10"
                        className="w-14 shrink-0 rounded-lg shadow-xs"
                      />
                      <div>
                        <div className="font-mono font-bold text-xs text-slate-900">
                          Room {s.roomNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">{s.roomTypeName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-slate-700">
                    {s.plan.name}
                  </td>
                  <td className="p-3 text-xs text-slate-600 whitespace-nowrap">
                    {formatDateTime(s.checkInAt)}
                  </td>
                  <td className="p-3 text-xs whitespace-nowrap">
                    {s.checkOutAt ? (
                      <span className="text-slate-600">{formatDateTime(s.checkOutAt)}</span>
                    ) : s.expectedCheckOutAt ? (
                      <span className="text-brand-900 font-medium">
                        Exp: {dayjs(s.expectedCheckOutAt).format("DD MMM, hh:mm A")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-mono font-bold text-xs text-slate-900">
                      {bill ? formatCurrency(bill.total) : formatCurrency(s.totalAmount)}
                    </div>
                    {isActive ? (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Adv: {formatCurrency(s.advanceAmount)}
                      </div>
                    ) : s.dueAmount > 0 ? (
                      <div className="text-[10px] font-bold text-rose-600">
                        Due: {formatCurrency(s.dueAmount)}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In-House
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Completed
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={onView}
                        className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        Folio
                      </button>
                      {isActive && (
                        <button
                          type="button"
                          onClick={onCheckout}
                          className="px-2 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Check Out
                        </button>
                      )}
                      {!isActive && (
                        <button
                          type="button"
                          onClick={onDelete}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </TableRow>
  );
}

