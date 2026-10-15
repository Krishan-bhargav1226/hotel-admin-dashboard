import { useFormikContext } from "formik";
import { MdKey, MdArrowForward } from "react-icons/md";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import { describePlan } from "../../../utils/helper/billing";
import { formatCurrency } from "../../../utils/helper/helper";
import { formatDateTime } from "../../../utils/date/dateUtils";
import { getRoomMeta } from "../../../utils/helper/roomImages";
import type { RatePlan, Room, RoomType } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";

interface CheckInSummaryProps {
  selectedRoom?: Room;
  roomTypes: RoomType[];
  activePlan?: RatePlan;
  expectedCheckOut: string | null;
  isLoading: boolean;
}

export default function CheckInSummary({ selectedRoom, roomTypes, activePlan, expectedCheckOut, isLoading }: CheckInSummaryProps) {
  const { values } = useFormikContext<CheckInFormValues>();
  return (
                <div>
                  <div className="sticky top-20 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                        <MdKey size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold tracking-tight text-slate-900">
                          Check-In Folio Preview
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Automated Billing Rules
                        </span>
                      </div>
                    </div>

                    {/* Room Key Hero Card with Photo */}
                    {selectedRoom ? (
                      <div className="mb-4 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/60 shadow-xs">
                        <RoomPhoto
                          room={selectedRoom}
                          roomType={roomTypes.find((t) => t.id === selectedRoom.roomTypeId)}
                          aspectRatio="video"
                          showBadge
                          className="h-32 w-full"
                        />
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-base font-extrabold text-slate-900">
                              Room {selectedRoom.number}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                              {selectedRoom.floor}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">
                            {roomTypes.find((t) => t.id === selectedRoom.roomTypeId)?.name || "Standard Room"}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {getRoomMeta(selectedRoom, roomTypes.find((t) => t.id === selectedRoom.roomTypeId)).bedConfig} · {getRoomMeta(selectedRoom, roomTypes.find((t) => t.id === selectedRoom.roomTypeId)).badge}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 rounded-xl bg-slate-50/80 border border-slate-100 p-4 text-center text-slate-400 text-xs">
                        Please select an available room from Step 3
                      </div>
                    )}

                    {/* Summary Lines */}
                    <div className="space-y-2.5 text-xs border-b border-slate-100 pb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Guest Type</span>
                        <span className="font-semibold text-slate-900">
                          {values.customerType === "REPEAT" ? "⭐ Returning Customer" : "✨ New Customer"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Party Size</span>
                        <span className="font-semibold text-slate-900">
                          {values.partyType} ({1 + values.companions.filter((c) => c.name.trim()).length} Person)
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Duration Model</span>
                        <span className="font-semibold text-brand-900">
                          {values.durationType === "HOURLY"
                            ? "Hourly Stay"
                            : values.durationType === "12_HOURS"
                            ? "12 Hours Pass"
                            : "Full Day (24h)"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Rate Plan</span>
                        <span className="font-semibold text-slate-900">
                          {activePlan?.name || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Rate Structure</span>
                        <span className="font-mono text-slate-700 font-medium">
                          {activePlan ? describePlan(activePlan) : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Expected Check-Out</span>
                        <span className="font-semibold text-slate-900">
                          {expectedCheckOut ? formatDateTime(expectedCheckOut) : "Flexible / By Hour"}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Billing Disclosure Box */}
                    <div className="my-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 p-3 text-xs text-amber-950">
                      <div className="font-bold text-amber-900 mb-0.5">
                        💡 Checkout Billing Calculation:
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {values.durationType === "HOURLY"
                          ? "At checkout, total bill calculates automatically based on exact elapsed hours multiplied by the hourly rate."
                          : values.durationType === "12_HOURS"
                          ? "Flat 12-hour tariff applies. If stay exceeds 12h, overtime charges apply automatically at checkout."
                          : "24-hour tariff applies. Overtime or extra night extensions calculate automatically upon checkout."}
                      </p>
                    </div>

                    {/* Advance Summary */}
                    <div className="py-2 flex justify-between items-center text-xs border-b border-slate-100">
                      <span className="text-slate-500">Advance Paid</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatCurrency(Number(values.advanceAmount) || 0)} ({values.advanceMode})
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isLoading || !values.roomId}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xs hover:bg-brand-800 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span>{isLoading ? "Assigning Room..." : "Confirm Check-In & Issue Room Key"}</span>
                        <MdArrowForward size={16} />
                      </button>
                    </div>
                  </div>
                </div>
  );
}


