import { hotelApi, run } from "../baseQuery";
import {
  DbKeys,
  readList,
  runExclusive,
  writeList,
} from "../../../utils/db/localDb";
import { uid } from "../../../utils/helper/helper";
import type {
  HousekeepingStatus,
  HousekeepingTask,
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceTicket,
  Room,
  RoomType,
} from "../../../utils/interfaces/Interface";

export interface CreateMaintenancePayload {
  roomId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  reportedBy: string;
  assignedTo?: string;
  cost?: number;
}

const housekeepingApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    getHousekeepingTasks: builder.query<HousekeepingTask[], void>({
      queryFn: () =>
        run(async () => {
          const rooms = await readList<Room>(DbKeys.ROOMS);
          const types = await readList<RoomType>(DbKeys.ROOM_TYPES);
          const tasks = await readList<HousekeepingTask>(DbKeys.HOUSEKEEPING);
          const taskMap = new Map(tasks.map((t) => [t.roomId, t]));

          // Synthesize tasks for all rooms so every room has a task status
          const merged: HousekeepingTask[] = rooms.map((r) => {
            const existing = taskMap.get(r.id);
            const type = types.find((t) => t.id === r.roomTypeId);
            let status: HousekeepingStatus = "CLEAN_INSPECTED";
            if (r.status === "CLEANING") status = "CLEANING";
            else if (r.status === "MAINTENANCE") status = "OUT_OF_ORDER";
            else if (existing?.status) status = existing.status;

            return {
              id: existing?.id || uid(),
              roomId: r.id,
              roomNumber: r.number,
              roomTypeName: type?.name || "Standard",
              status,
              assignedTo: existing?.assignedTo,
              priority: existing?.priority || "NORMAL",
              notes: existing?.notes,
              lastCleanedAt: existing?.lastCleanedAt,
              updatedAt: existing?.updatedAt || r.updatedAt,
            };
          });

          return merged.sort((a, b) =>
            a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
          );
        }),
      providesTags: ["Housekeeping", "Room"],
    }),

    updateHousekeepingStatus: builder.mutation<
      HousekeepingTask,
      {
        roomId: string;
        status: HousekeepingStatus;
        assignedTo?: string;
        notes?: string;
      }
    >({
      queryFn: ({ roomId, status, assignedTo, notes }) =>
        run(() =>
          runExclusive(async () => {
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const types = await readList<RoomType>(DbKeys.ROOM_TYPES);
            const tasks = await readList<HousekeepingTask>(DbKeys.HOUSEKEEPING);

            const room = rooms.find((r) => r.id === roomId);
            if (!room) throw new Error("Room not found");

            const type = types.find((t) => t.id === room.roomTypeId);
            const now = new Date().toISOString();

            let task = tasks.find((t) => t.roomId === roomId);
            if (!task) {
              task = {
                id: uid(),
                roomId,
                roomNumber: room.number,
                roomTypeName: type?.name || "Standard",
                status,
                assignedTo,
                priority: "NORMAL",
                notes,
                lastCleanedAt: status === "CLEAN_INSPECTED" ? now : undefined,
                updatedAt: now,
              };
              tasks.push(task);
            } else {
              task.status = status;
              if (assignedTo !== undefined) task.assignedTo = assignedTo;
              if (notes !== undefined) task.notes = notes;
              if (status === "CLEAN_INSPECTED") task.lastCleanedAt = now;
              task.updatedAt = now;
            }

            // Sync with Room status
            if (status === "CLEAN_INSPECTED") {
              if (room.status === "CLEANING" || room.status === "MAINTENANCE") {
                room.status = "AVAILABLE";
                room.updatedAt = now;
              }
            } else if (status === "CLEANING") {
              if (room.status !== "OCCUPIED") {
                room.status = "CLEANING";
                room.updatedAt = now;
              }
            } else if (status === "OUT_OF_ORDER") {
              room.status = "MAINTENANCE";
              room.updatedAt = now;
            }

            await writeList(DbKeys.HOUSEKEEPING, tasks);
            await writeList(DbKeys.ROOMS, rooms);
            return task;
          })
        ),
      invalidatesTags: ["Housekeeping", "Room"],
    }),

    /* Maintenance Tickets */
    getMaintenanceTickets: builder.query<MaintenanceTicket[], void>({
      queryFn: () =>
        run(async () => {
          const tickets = await readList<MaintenanceTicket>(DbKeys.MAINTENANCE);
          return tickets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        }),
      providesTags: ["Maintenance"],
    }),

    createMaintenanceTicket: builder.mutation<MaintenanceTicket, CreateMaintenancePayload>({
      queryFn: (payload) =>
        run(() =>
          runExclusive(async () => {
            const tickets = await readList<MaintenanceTicket>(DbKeys.MAINTENANCE);
            const rooms = await readList<Room>(DbKeys.ROOMS);
            const room = rooms.find((r) => r.id === payload.roomId);
            if (!room) throw new Error("Room not found");

            const now = new Date().toISOString();
            const ticketNo = `MT-${String(tickets.length + 1).padStart(4, "0")}`;

            const ticket: MaintenanceTicket = {
              id: uid(),
              ticketNo,
              roomId: payload.roomId,
              roomNumber: room.number,
              title: payload.title.trim(),
              description: payload.description.trim(),
              priority: payload.priority,
              status: "OPEN",
              reportedBy: payload.reportedBy.trim(),
              assignedTo: payload.assignedTo?.trim(),
              cost: payload.cost || 0,
              createdAt: now,
            };

            // If urgent/emergency, put room under maintenance
            if (payload.priority === "EMERGENCY" || payload.priority === "HIGH") {
              room.status = "MAINTENANCE";
              room.updatedAt = now;
              await writeList(DbKeys.ROOMS, rooms);
            }

            await writeList(DbKeys.MAINTENANCE, [ticket, ...tickets]);
            return ticket;
          })
        ),
      invalidatesTags: ["Maintenance", "Room", "Housekeeping"],
    }),

    updateMaintenanceTicket: builder.mutation<
      MaintenanceTicket,
      {
        id: string;
        status?: MaintenanceStatus;
        assignedTo?: string;
        cost?: number;
      }
    >({
      queryFn: ({ id, status, assignedTo, cost }) =>
        run(() =>
          runExclusive(async () => {
            const tickets = await readList<MaintenanceTicket>(DbKeys.MAINTENANCE);
            const ticket = tickets.find((t) => t.id === id);
            if (!ticket) throw new Error("Ticket not found");

            const now = new Date().toISOString();
            if (status) {
              ticket.status = status;
              if (status === "RESOLVED") {
                ticket.resolvedAt = now;

                // Check if room can be made available
                const rooms = await readList<Room>(DbKeys.ROOMS);
                const room = rooms.find((r) => r.id === ticket.roomId);
                if (room && room.status === "MAINTENANCE") {
                  room.status = "AVAILABLE";
                  room.updatedAt = now;
                  await writeList(DbKeys.ROOMS, rooms);
                }
              }
            }
            if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
            if (cost !== undefined) ticket.cost = cost;

            await writeList(DbKeys.MAINTENANCE, tickets);
            return ticket;
          })
        ),
      invalidatesTags: ["Maintenance", "Room", "Housekeeping"],
    }),
  }),
});

export const {
  useGetHousekeepingTasksQuery,
  useUpdateHousekeepingStatusMutation,
  useGetMaintenanceTicketsQuery,
  useCreateMaintenanceTicketMutation,
  useUpdateMaintenanceTicketMutation,
} = housekeepingApi;
