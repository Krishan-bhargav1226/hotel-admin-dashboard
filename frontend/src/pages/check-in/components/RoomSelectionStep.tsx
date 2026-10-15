import { useFormikContext } from "formik";
import RoomCardSelect from "../../../components/ui/room/RoomCardSelect";
import { getRoomMeta } from "../../../utils/helper/roomImages";
import type { Room, RoomType } from "../../../utils/interfaces/Interface";
import type { CheckInFormValues } from "../types";

interface RoomSelectionStepProps {
  availableRooms: Room[];
  roomTypes: RoomType[];
  roomCategoryFilter: string;
  setRoomCategoryFilter: (filter: string) => void;
}

export default function RoomSelectionStep({ availableRooms, roomTypes, roomCategoryFilter, setRoomCategoryFilter }: RoomSelectionStepProps) {
  const { values, setFieldValue } = useFormikContext<CheckInFormValues>();
  return (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          Step 3 of 4 · Visual Inventory Selection
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          Room Allocation ({availableRooms.length} Available Rooms)
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <span>Tailored for:</span>
                        <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          {values.partyType === "FAMILY"
                            ? "Family / Group (3-5 Guests)"
                            : values.partyType === "COUPLE"
                            ? "Couple / Romance (King Bed)"
                            : values.partyType === "ACCESSIBLE"
                            ? "Senior / Accessible (Step-Free)"
                            : values.partyType === "VIP"
                            ? "VIP Penthouse (Terrace & Butler)"
                            : "Solo / Business (Workstation)"}
                        </span>
                      </div>
                    </div>

                    {/* Filter Tabs by Room Category / Guest Type */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-slate-50/80 p-1.5 rounded-xl border border-slate-100">
                      {[
                        { id: "ALL", label: `All Rooms (${availableRooms.length})` },
                        { id: "COUPLE", label: "Couples & Romance" },
                        { id: "SOLO", label: "Business & Solo" },
                        { id: "FAMILY", label: "Family Suites" },
                        { id: "ACCESSIBLE", label: "Accessible / Seniors" },
                        { id: "PRESIDENTIAL", label: "VIP Penthouse" },
                        { id: "BUDGET", label: "Budget Transit" },
                      ].map((tab) => {
                        const count = availableRooms.filter((r) => {
                          if (tab.id === "ALL") return true;
                          const meta = getRoomMeta(r, roomTypes.find((t) => t.id === r.roomTypeId));
                          return meta.category === tab.id;
                        }).length;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setRoomCategoryFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              roomCategoryFilter === tab.id
                                ? "bg-brand-700 text-white shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            }`}
                          >
                            <span>{tab.label}</span>
                            {tab.id !== "ALL" && (
                              <span className="ml-1 opacity-70 text-[10px]">({count})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {availableRooms.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No available rooms found. Please free up a room or mark one clean.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto p-1">
                        {availableRooms
                          .filter((r) => {
                            if (roomCategoryFilter === "ALL") return true;
                            const meta = getRoomMeta(r, roomTypes.find((t) => t.id === r.roomTypeId));
                            return meta.category === roomCategoryFilter;
                          })
                          .map((r) => {
                            const rType = roomTypes.find((t) => t.id === r.roomTypeId);
                            const meta = getRoomMeta(r, rType);
                            const isSelected = values.roomId === r.id;

                            // Check recommendation
                            const isRecommended =
                              (values.partyType === "COUPLE" && meta.category === "COUPLE") ||
                              (values.partyType === "FAMILY" && meta.category === "FAMILY") ||
                              (values.partyType === "SINGLE" && (meta.category === "SOLO" || meta.category === "BUDGET")) ||
                              (values.partyType === "ACCESSIBLE" && meta.category === "ACCESSIBLE") ||
                              (values.partyType === "VIP" && meta.category === "PRESIDENTIAL");

                            return (
                              <RoomCardSelect
                                key={r.id}
                                room={r}
                                roomType={rType}
                                isSelected={isSelected}
                                onSelect={() => setFieldValue("roomId", r.id)}
                                recommendedReason={isRecommended ? `Recommended for ${values.partyType}` : undefined}
                              />
                            );
                          })}
                      </div>
                    )}
                  </div>
  );
}


