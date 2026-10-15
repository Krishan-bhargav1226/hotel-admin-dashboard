import { useMemo } from "react";
import dayjs from "dayjs";
import type { HousekeepingTask, MaintenanceTicket, Reservation, Room, StaffMember } from "../../utils/interfaces/Interface";

type EnrichedTask = HousekeepingTask & { room?: Room; isRush: boolean };
interface HousekeepingDataArgs {
  tasks: HousekeepingTask[];
  tickets: MaintenanceTicket[];
  staff: StaffMember[];
  rooms: Room[];
  reservations: Reservation[];
  filterFloor: string;
  filterStatus: string;
  filterStaff: string;
}

export default function useHousekeepingData({ tasks, tickets, staff, rooms, reservations, filterFloor, filterStatus, filterStaff }: HousekeepingDataArgs) {
  const staffOptions = useMemo(() => staff.filter((member) => ["HOUSEKEEPING", "MAINTENANCE", "MANAGER"].includes(member.role)), [staff]);
  const rushRoomIds = useMemo(() => {
    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    return new Set(reservations.filter((reservation) => reservation.roomId && [today, tomorrow].includes(dayjs(reservation.checkInDate).format("YYYY-MM-DD")) && reservation.status === "CONFIRMED").map((reservation) => reservation.roomId!));
  }, [reservations]);
  const enrichedTasks = useMemo<EnrichedTask[]>(() => tasks.map((task) => ({ ...task, room: rooms.find((room) => room.id === task.roomId), isRush: rushRoomIds.has(task.roomId) || task.priority === "RUSH" })), [tasks, rooms, rushRoomIds]);
  const stats = useMemo(() => ({
    clean: enrichedTasks.filter((task) => task.status === "CLEAN_INSPECTED").length,
    cleaning: enrichedTasks.filter((task) => task.status === "CLEANING").length,
    dirty: enrichedTasks.filter((task) => task.status === "DIRTY").length,
    ooo: enrichedTasks.filter((task) => task.status === "OUT_OF_ORDER").length,
    rushCount: enrichedTasks.filter((task) => task.isRush && task.status !== "CLEAN_INSPECTED").length,
    openTickets: tickets.filter((ticket) => ticket.status !== "RESOLVED").length,
    total: enrichedTasks.length,
  }), [enrichedTasks, tickets]);
  const filteredTasks = useMemo(() => enrichedTasks.filter((task) => (filterStatus === "ALL" || task.status === filterStatus) && (filterFloor === "ALL" || task.room?.floor === filterFloor) && (filterStaff === "ALL" || task.assignedTo === filterStaff)), [enrichedTasks, filterStatus, filterFloor, filterStaff]);
  const availableFloors = useMemo(() => [...new Set(rooms.map((room) => room.floor).filter(Boolean))].sort(), [rooms]);

  return { staffOptions, enrichedTasks, stats, filteredTasks, availableFloors };
}

export type { EnrichedTask };
