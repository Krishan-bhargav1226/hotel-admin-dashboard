import { useState, type Dispatch, type SetStateAction } from "react";
import dayjs from "dayjs";
import {
  ClipboardCheck,
  Sparkles,
  GripVertical,
  ArrowDown,
  Clock,
  Timer,
  AlertTriangle,
} from "lucide-react";
import RoomPhoto from "../../../components/ui/room/RoomPhoto";
import SectionBox from "../../../components/ui/container/SectionBox";
import { STATUS_CONFIG } from "./statusConfig";
import type { HousekeepingStatus, HousekeepingTask, Room, StaffMember } from "../../../utils/interfaces/Interface";

type ViewMode = "KANBAN" | "FLOOR_GRID";
type EnrichedHousekeepingTask = HousekeepingTask & { room?: Room; isRush: boolean };

interface TurnoverOperationsProps {
  viewMode: ViewMode;
  filterFloor: string;
  setFilterFloor: Dispatch<SetStateAction<string>>;
  filterCleanStatus: string;
  setFilterCleanStatus: Dispatch<SetStateAction<string>>;
  filterStaff: string;
  setFilterStaff: Dispatch<SetStateAction<string>>;
  availableFloors: string[];
  staffOptions: StaffMember[];
  enrichedTasks: EnrichedHousekeepingTask[];
  filteredTasks: EnrichedHousekeepingTask[];
  handleStatusChange: (roomId: string, status: HousekeepingStatus, assignedTo?: string) => Promise<void>;
  handleOpenInspection: (task: HousekeepingTask) => void;
}

const stages: HousekeepingStatus[] = ["DIRTY", "CLEANING", "CLEAN_INSPECTED", "OUT_OF_ORDER"];

export default function TurnoverOperations({
  viewMode, filterFloor, setFilterFloor, filterCleanStatus, setFilterCleanStatus,
  filterStaff, setFilterStaff, availableFloors, staffOptions, enrichedTasks,
  filteredTasks, handleStatusChange, handleOpenInspection,
}: TurnoverOperationsProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<HousekeepingStatus | null>(null);

  const rushTasks = enrichedTasks.filter((task) => task.isRush && task.status !== "CLEAN_INSPECTED");
  const activeDraggedTask = enrichedTasks.find((t) => t.id === draggedTaskId);

  const handleDragStart = (e: React.DragEvent<HTMLElement>, task: EnrichedHousekeepingTask) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        taskId: task.id,
        roomId: task.roomId,
        currentStatus: task.status,
        assignedTo: task.assignedTo,
      })
    );
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStage(null);
  };

  const handleDragOverColumn = (e: React.DragEvent<HTMLElement>, stage: HousekeepingStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent<HTMLElement>, stage: HousekeepingStatus) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stage) {
      setDragOverStage(null);
    }
  };

  const handleDropOnColumn = async (e: React.DragEvent<HTMLElement>, targetStage: HousekeepingStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    setDraggedTaskId(null);

    try {
      let roomId = "";
      let currentStatus: HousekeepingStatus | string = "";
      let assignedTo: string | undefined = undefined;

      const rawData = e.dataTransfer.getData("application/json");
      if (rawData) {
        const parsed = JSON.parse(rawData);
        roomId = parsed.roomId;
        currentStatus = parsed.currentStatus;
        assignedTo = parsed.assignedTo;
      } else {
        const taskId = e.dataTransfer.getData("text/plain");
        const found = enrichedTasks.find((t) => t.id === taskId);
        if (found) {
          roomId = found.roomId;
          currentStatus = found.status;
          assignedTo = found.assignedTo;
        }
      }

      if (!roomId || currentStatus === targetStage) return;

      await handleStatusChange(roomId, targetStage, assignedTo);
    } catch (err) {
      console.error("Failed to complete drag-and-drop status update", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-card">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock size={14} />Status:</span>
          {(["ALL", ...stages] as const).map((status) => (
            <button key={status} type="button" onClick={() => setFilterCleanStatus(status)} className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${filterCleanStatus === status ? "bg-brand-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {status === "ALL" ? "All Rooms" : STATUS_CONFIG[status].stage}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <select aria-label="Filter by floor" value={filterFloor} onChange={(event) => setFilterFloor(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none">
            <option value="ALL">All Floors</option>{availableFloors.map((floor) => <option key={floor} value={floor}>{floor}</option>)}
          </select>
          <select aria-label="Filter by staff" value={filterStaff} onChange={(event) => setFilterStaff(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none">
            <option value="ALL">All Housekeepers</option>{staffOptions.map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}
          </select>
        </div>
      </div>

      {rushTasks.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
          <AlertTriangle size={16} /> {rushTasks.length} rush {rushTasks.length === 1 ? "room needs" : "rooms need"} cleaning before guest arrival.
        </div>
      )}

      {viewMode === "KANBAN" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <GripVertical size={14} />
              </span>
              <span>Drag & drop room cards across stages to change room status instantly</span>
            </div>
            {draggedTaskId && (
              <span className="animate-pulse rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                Moving Room {activeDraggedTask?.roomNumber || ""}...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stages.map((stage) => {
              const config = STATUS_CONFIG[stage];
              const stageTasks = filteredTasks.filter((task) => task.status === stage);
              const isOverThisStage = dragOverStage === stage;
              const isSourceStage = activeDraggedTask?.status === stage;
              const canDropHere = draggedTaskId !== null && !isSourceStage;

              return (
                <section
                  key={stage}
                  onDragOver={(e) => handleDragOverColumn(e, stage)}
                  onDragLeave={(e) => handleDragLeaveColumn(e, stage)}
                  onDrop={(e) => void handleDropOnColumn(e, stage)}
                  className={`flex min-h-[460px] flex-col rounded-2xl border p-4 shadow-card transition-all duration-200 ${
                    isOverThisStage && canDropHere
                      ? "border-2 border-dashed bg-emerald-50/50 ring-4 ring-emerald-500/20"
                      : draggedTaskId
                      ? "border-slate-300/80 bg-slate-50/90"
                      : "border-slate-200/90 bg-slate-50/70"
                  }`}
                  style={{
                    borderColor: isOverThisStage && canDropHere ? config.color : undefined,
                  }}
                >
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
                      <h3 className="text-sm font-bold text-slate-900">{config.stage}</h3>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-600 shadow-2xs">
                      {stageTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
                    {stageTasks.map((task) => {
                      const isBeingDragged = draggedTaskId === task.id;
                      return (
                        <article
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className={`group relative overflow-hidden rounded-xl border bg-white shadow-card transition-all duration-150 cursor-grab active:cursor-grabbing ${
                            isBeingDragged
                              ? "opacity-40 scale-[0.98] border-dashed border-emerald-500 shadow-none ring-2 ring-emerald-400/40"
                              : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                          } ${task.isRush ? "ring-1 ring-rose-300" : ""}`}
                        >
                          <div className="relative">
                            <RoomPhoto room={task.room} aspectRatio="video" height="h-28" className="w-full" />
                            <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 font-mono text-xs font-bold text-white shadow-xs">
                              Room {task.roomNumber}
                            </span>
                            <div className="absolute right-2 top-2 flex items-center gap-1">
                              {task.isRush && (
                                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                  Rush
                                </span>
                              )}
                              <span
                                title="Drag to change stage"
                                className="flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs transition group-hover:bg-black/80"
                              >
                                <GripVertical size={12} />
                                <span>Drag</span>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2.5 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs font-semibold text-slate-700">{task.roomTypeName}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.bg}`}>
                                {config.label}
                              </span>
                            </div>

                            {task.notes && (
                              <p className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100">
                                {task.notes}
                              </p>
                            )}

                            {task.status === "CLEANING" && (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-sky-700">
                                <Timer size={13} /> Started {dayjs(task.updatedAt).format("hh:mm A")}
                              </div>
                            )}

                            <label
                              draggable={false}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="flex items-center justify-between gap-2 text-[11px] text-slate-500"
                            >
                              <span>Assigned to</span>
                              <select
                                aria-label={`Assign room ${task.roomNumber}`}
                                value={task.assignedTo || ""}
                                onChange={(event) => void handleStatusChange(task.roomId, task.status, event.target.value)}
                                className="max-w-40 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                              >
                                <option value="">Unassigned</option>
                                {staffOptions.map((member) => (
                                  <option key={member.id} value={member.name}>
                                    {member.name}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <div
                              draggable={false}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="flex gap-2 border-t border-slate-100 pt-2"
                            >
                              {task.status !== "CLEAN_INSPECTED" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenInspection(task)}
                                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                                >
                                  <ClipboardCheck size={14} />
                                  <span>Inspect</span>
                                </button>
                              )}
                              {task.status !== "CLEANING" && task.status !== "OUT_OF_ORDER" && (
                                <button
                                  type="button"
                                  onClick={() => void handleStatusChange(task.roomId, "CLEANING")}
                                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                                >
                                  <Sparkles size={14} />
                                  <span>Start cleaning</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}

                    {/* Interactive drop zone indicator when dragging over column */}
                    {isOverThisStage && canDropHere && (
                      <div
                        className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-5 text-center text-xs font-bold transition-all animate-pulse"
                        style={{
                          borderColor: config.color,
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                        }}
                      >
                        <ArrowDown size={22} />
                        <span>Move Room {activeDraggedTask?.roomNumber} to {config.stage}</span>
                      </div>
                    )}

                    {stageTasks.length === 0 && !isOverThisStage && (
                      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs text-slate-400">
                        <GripVertical size={20} className="mb-1 text-slate-300" />
                        <p className="font-semibold text-slate-500">No rooms in this stage</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Drag a room card here to update status</p>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {availableFloors.filter((floor) => filterFloor === "ALL" || floor === filterFloor).map((floor) => {
            const floorTasks = filteredTasks.filter((task) => (task.room?.floor || "Floor 1") === floor);
            if (floorTasks.length === 0) return null;
            return (
              <section key={floor} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3"><h3 className="text-base font-extrabold text-slate-900">{floor} <span className="text-xs font-medium text-slate-500">({floorTasks.length} rooms)</span></h3><span className="text-xs font-semibold text-emerald-700">{floorTasks.filter((task) => task.status === "CLEAN_INSPECTED").length} guest ready</span></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {floorTasks.map((task) => {
                    const config = STATUS_CONFIG[task.status];
                    return (
                      <article key={task.roomId} className={`overflow-hidden rounded-xl border border-slate-200 border-t-4 bg-white p-3.5 shadow-card ${config.border}`}>
                        <RoomPhoto room={task.room} aspectRatio="video" height="h-28" className="mb-3 w-full rounded-lg" enableZoom />
                        <div className="mb-2 flex items-center justify-between gap-2"><span className="font-mono text-sm font-extrabold text-slate-900">Room {task.roomNumber}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.bg}`}>{config.label}</span></div>
                        <p className="truncate text-xs text-slate-500">{task.roomTypeName}</p><p className="mt-2 text-xs text-slate-600">Cleaner: <strong>{task.assignedTo || "Unassigned"}</strong></p>
                        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-2">{task.status !== "CLEAN_INSPECTED" && <button type="button" onClick={() => handleOpenInspection(task)} className="flex-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Inspect</button>}{task.status !== "CLEANING" && task.status !== "OUT_OF_ORDER" && <button type="button" onClick={() => void handleStatusChange(task.roomId, "CLEANING")} className="flex-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">Cleaning</button>}</div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <SectionBox className="!p-5 bg-white shadow-card rounded-2xl border border-slate-200/90">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Linen, Amenities & Cleaning Supplies Readiness</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[["Bed Linens & Duvets", "88%", "88%", "45 clean sets in laundry store"], ["Plush Bath Towels", "92%", "92%", "60 sets ready on service trolley"], ["Toiletries & Dental Kits", "68%", "68%", "Refill ordered from vendor"], ["Bottled Water & Tea Station", "80%", "80%", "72 bottles ready for distribution"]].map(([name, value, width, note]) => (
            <div key={name} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="mb-1 flex justify-between text-xs font-semibold"><span className="text-slate-700">{name}</span><span className="font-mono text-emerald-600">{value}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width }} /></div><span className="mt-1 block text-[10px] text-slate-400">{note}</span></div>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}
